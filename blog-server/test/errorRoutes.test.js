const test = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const express = require('express')

function loadRouter(routeName, { db, recordError } = {}) {
  const routePath = require.resolve(`../routes/${routeName}`)
  const originalLoad = Module._load
  const passThrough = (_req, _res, next) => next()

  Module._load = function (request, parent, isMain) {
    if (request === '@utils/mysqlUtils') return db
    if (request === '@utils/errorMonitor') return { recordError }
    if (request === '@middleware/rateLimit') return { errorReportLimiter: passThrough }
    if (request === '@middleware/checkRole') {
      return (req, res, next) => {
        if (req.get('X-Test-Role') === 'denied') return res.status(403).send({ message: '无权限访问' })
        next()
      }
    }
    return originalLoad.call(this, request, parent, isMain)
  }

  delete require.cache[routePath]
  try {
    return { router: require(`../routes/${routeName}`), routePath }
  } finally {
    Module._load = originalLoad
  }
}

async function requestRoute({ routeName, path = '/', method = 'GET', body, headers = {}, modules }) {
  const app = express()
  if (routeName !== 'errorReport') app.use(express.json())
  const { router, routePath } = loadRouter(routeName, modules)
  app.use(`/api/${routeName}`, router)
  app.use((error, _req, res, _next) => res.status(error.status || 500).send({ message: error.message }))
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance))
  })

  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/${routeName}${path}`, {
      method,
      headers: body === undefined ? headers : { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const text = await response.text()
    let responseBody = text
    try {
      responseBody = JSON.parse(text)
    } catch (_error) {
      // Keep non-JSON responses as text.
    }
    return { response, body: responseBody }
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    delete require.cache[routePath]
  }
}

test('client error report validates its message before recording', async () => {
  let calls = 0
  const result = await requestRoute({
    routeName: 'errorReport',
    method: 'POST',
    body: { message: '   ' },
    modules: { recordError: async () => { calls += 1 } },
  })

  assert.equal(result.response.status, 400)
  assert.equal(result.body.message, '错误信息不能为空')
  assert.equal(calls, 0)
})

test('client error report records normalized request metadata', async () => {
  let recorded
  const { response } = await requestRoute({
    routeName: 'errorReport',
    method: 'POST',
    headers: { 'User-Agent': 'test-browser', 'X-Request-Id': 'request-header-is-not-trusted' },
    body: { message: '  Render failed  ', route: '/message?secret=yes', method: 'get', statusCode: 500 },
    modules: { recordError: async (error) => { recorded = error } },
  })

  assert.equal(response.status, 204)
  assert.equal(recorded.source, 'client')
  assert.equal(recorded.message, 'Render failed')
  assert.equal(recorded.userAgent, 'test-browser')
  assert.equal(recorded.requestId, undefined)
})

test('client error report rejects payloads above its parser limit', async () => {
  const { response } = await requestRoute({
    routeName: 'errorReport',
    method: 'POST',
    body: { message: 'x'.repeat(33 * 1024) },
    modules: { recordError: async () => {} },
  })

  assert.equal(response.status, 413)
})

test('error monitor denies unauthorized requests before querying the database', async () => {
  let queried = false
  const db = { promise: () => ({ query: async () => { queried = true } }) }
  const { response } = await requestRoute({
    routeName: 'errorMonitor',
    headers: { 'X-Test-Role': 'denied' },
    modules: { db },
  })

  assert.equal(response.status, 403)
  assert.equal(queried, false)
})

test('error monitor lists resolved errors and normalizes its summary', async () => {
  const calls = []
  const db = {
    promise: () => ({
      async query(sql, values) {
        calls.push({ sql, values })
        if (/COUNT\(\*\)/.test(sql)) return [[{ total: '3', openCount: '1', occurrences: '8' }]]
        return [[{ id: 2, resolved: 1 }]]
      },
    }),
  }

  const { response, body } = await requestRoute({
    routeName: 'errorMonitor',
    path: '/?status=resolved',
    modules: { db },
  })

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.deepEqual(body, {
    items: [{ id: 2, resolved: 1 }],
    summary: { total: 3, openCount: 1, occurrences: 8 },
  })
  assert.deepEqual(calls[0].values, [1])
})

test('error monitor forwards list database failures', async () => {
  const { response, body } = await requestRoute({
    routeName: 'errorMonitor',
    modules: {
      db: { promise: () => ({ query: async () => { throw new Error('database unavailable') } }) },
    },
  })

  assert.equal(response.status, 500)
  assert.equal(body.message, 'database unavailable')
})

test('error monitor validates resolve requests before accessing the database', async () => {
  let calls = 0
  const db = { promise: () => ({ query: async () => { calls += 1 } }) }

  const invalidId = await requestRoute({
    routeName: 'errorMonitor',
    path: '/invalid/resolve',
    method: 'PUT',
    body: { resolved: true },
    modules: { db },
  })
  const invalidStatus = await requestRoute({
    routeName: 'errorMonitor',
    path: '/2/resolve',
    method: 'PUT',
    body: { resolved: 1 },
    modules: { db },
  })

  assert.equal(invalidId.response.status, 400)
  assert.equal(invalidStatus.response.status, 400)
  assert.equal(calls, 0)
})

test('error monitor resolves existing records and reports missing records', async () => {
  const resolved = await requestRoute({
    routeName: 'errorMonitor',
    path: '/7/resolve',
    method: 'PUT',
    body: { resolved: true },
    modules: { db: { promise: () => ({ query: async () => [{ affectedRows: 1 }] }) } },
  })
  const missing = await requestRoute({
    routeName: 'errorMonitor',
    path: '/8/resolve',
    method: 'PUT',
    body: { resolved: false },
    modules: { db: { promise: () => ({ query: async () => [{ affectedRows: 0 }] }) } },
  })

  assert.equal(resolved.response.status, 200)
  assert.deepEqual(resolved.body, { id: 7, resolved: true })
  assert.equal(missing.response.status, 404)
})

test('error monitor forwards resolve database failures', async () => {
  const { response, body } = await requestRoute({
    routeName: 'errorMonitor',
    path: '/7/resolve',
    method: 'PUT',
    body: { resolved: true },
    modules: {
      db: { promise: () => ({ query: async () => { throw new Error('database unavailable') } }) },
    },
  })

  assert.equal(response.status, 500)
  assert.equal(body.message, 'database unavailable')
})

test('error monitor validates delete ids and forwards database failures', async () => {
  const invalid = await requestRoute({
    routeName: 'errorMonitor',
    path: '/0',
    method: 'DELETE',
    modules: { db: { promise: () => ({ query: async () => { throw new Error('should not run') } }) } },
  })
  const failed = await requestRoute({
    routeName: 'errorMonitor',
    path: '/3',
    method: 'DELETE',
    modules: { db: { promise: () => ({ query: async () => { throw new Error('database unavailable') } }) } },
  })

  assert.equal(invalid.response.status, 400)
  assert.equal(failed.response.status, 500)
  assert.equal(failed.body.message, 'database unavailable')
})

test('error monitor deletes existing records and reports missing records', async () => {
  const deleted = await requestRoute({
    routeName: 'errorMonitor',
    path: '/3',
    method: 'DELETE',
    modules: { db: { promise: () => ({ query: async () => [{ affectedRows: 1 }] }) } },
  })
  const missing = await requestRoute({
    routeName: 'errorMonitor',
    path: '/4',
    method: 'DELETE',
    modules: { db: { promise: () => ({ query: async () => [{ affectedRows: 0 }] }) } },
  })

  assert.equal(deleted.response.status, 204)
  assert.equal(missing.response.status, 404)
  assert.equal(missing.body.message, '错误记录不存在')
})
