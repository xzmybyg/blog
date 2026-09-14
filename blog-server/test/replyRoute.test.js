const test = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const express = require('express')

function loadRouter(db, user = { id: 17, role: 'user' }) {
  const routePath = require.resolve('../routes/reply')
  const originalLoad = Module._load
  const passThrough = (_req, _res, next) => next()

  Module._load = function (request, parent, isMain) {
    if (request === '@utils/mysqlUtils') return db
    if (request === '@middleware/checkToken') {
      return (req, res, next) => {
        if (req.get('X-Test-Token') === 'missing') return res.status(401).send({ message: '请先登录' })
        req.user = user
        next()
      }
    }
    if (request === '@middleware/checkRole') {
      return (req, res, next) => {
        if (req.get('X-Test-Role') === 'denied') return res.status(403).send({ message: '无权限访问' })
        next()
      }
    }
    if (request === '@middleware/rateLimit') return { interactionLimiter: passThrough }
    return originalLoad.call(this, request, parent, isMain)
  }

  delete require.cache[routePath]
  try {
    return { router: require('../routes/reply'), routePath }
  } finally {
    Module._load = originalLoad
  }
}

async function requestReply({ path = '/', method = 'POST', body, headers = {}, db, user }) {
  const app = express()
  app.use(express.json())
  const { router, routePath } = loadRouter(db, user)
  app.use('/api/reply', router)
  app.use((error, _req, res, _next) => res.status(500).send({ message: error.message }))
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance))
  })

  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/reply${path}`, {
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

test('reply creation requires authentication before accessing the database', async () => {
  let queried = false
  const { response } = await requestReply({
    headers: { 'X-Test-Token': 'missing' },
    body: { params: { reply_comment_id: 2, reply_user_id: 3, content: 'Hello' } },
    db: { query: () => { queried = true } },
  })

  assert.equal(response.status, 401)
  assert.equal(queried, false)
})

test('reply creation validates required parameters without querying the database', async () => {
  let calls = 0
  const db = { query: () => { calls += 1 } }
  const cases = [
    undefined,
    { params: {} },
    { params: { reply_comment_id: 0, reply_user_id: 3, content: 'Hello' } },
    { params: { reply_comment_id: 2, reply_user_id: -1, content: 'Hello' } },
    { params: { reply_comment_id: 2, reply_user_id: 3, content: '   ' } },
    { params: { reply_comment_id: 2, reply_user_id: 3, content: 'x'.repeat(1001) } },
  ]

  for (const body of cases) {
    const result = await requestReply({ body, db })
    assert.equal(result.response.status, 400)
    assert.equal(result.body.message, '回复信息无效')
  }
  assert.equal(calls, 0)
})

test('reply creation trusts the authenticated user and normalizes values', async () => {
  let insertParams
  const db = {
    query(_sql, params, callback) {
      insertParams = params
      callback(null, { insertId: 9 })
    },
  }
  const { response, body } = await requestReply({
    body: {
      params: {
        user_id: 999,
        reply_comment_id: '2',
        reply_user_id: '3',
        content: '  Hello  ',
        createTime: '2026-09-14 12:00:00',
      },
    },
    user: { id: 17, role: 'user' },
    db,
  })

  assert.equal(response.status, 201)
  assert.equal(body, 'Reply created')
  assert.deepEqual(insertParams, [17, 2, 3, 'Hello', '2026-09-14 12:00:00'])
})

test('reply creation reports database errors', async () => {
  const db = { query: (_sql, _params, callback) => callback(new Error('database unavailable')) }
  const { response, body } = await requestReply({
    body: { params: { reply_comment_id: 2, reply_user_id: 3, content: 'Hello' } },
    db,
  })

  assert.equal(response.status, 500)
  assert.equal(body, 'Server error')
})

test('reply deletion requires an authorized role before querying the database', async () => {
  let queried = false
  const { response } = await requestReply({
    path: '/?id=4',
    method: 'DELETE',
    headers: { 'X-Test-Role': 'denied' },
    db: { query: () => { queried = true } },
  })

  assert.equal(response.status, 403)
  assert.equal(queried, false)
})

test('reply deletion validates its id before querying the database', async () => {
  let queried = false
  const { response, body } = await requestReply({
    path: '/?id=invalid',
    method: 'DELETE',
    db: { query: () => { queried = true } },
  })

  assert.equal(response.status, 400)
  assert.equal(body.message, '回复 ID 无效')
  assert.equal(queried, false)
})

test('reply deletion forwards a normalized id and reports database errors', async () => {
  let deleteParams
  const deleted = await requestReply({
    path: '/?id=4',
    method: 'DELETE',
    db: { query: (_sql, params, callback) => { deleteParams = params; callback(null, { affectedRows: 1 }) } },
  })
  const failed = await requestReply({
    path: '/?id=5',
    method: 'DELETE',
    db: { query: (_sql, _params, callback) => callback(new Error('database unavailable')) },
  })

  assert.equal(deleted.response.status, 204)
  assert.deepEqual(deleteParams, [4])
  assert.equal(failed.response.status, 500)
  assert.equal(failed.body, 'Server error')
})
