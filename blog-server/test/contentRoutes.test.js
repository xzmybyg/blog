const test = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const express = require('express')

function loadRouter(routeName, { db = {}, fs } = {}) {
  const routePath = require.resolve(`../routes/${routeName}`)
  const originalLoad = Module._load
  const passThrough = (_req, _res, next) => next()

  Module._load = function (request, parent, isMain) {
    if (request === '@utils/mysqlUtils') return db
    if (request === '@utils/visitorId') return (visitorId) => visitorId ? `hash:${visitorId}` : ''
    if (request === '@middleware/checkRole') return passThrough
    if (request === '@middleware/rateLimit') {
      return { pageViewLimiter: passThrough, uploadLimiter: passThrough }
    }
    if (request === 'fs/promises' && fs) return fs
    return originalLoad.call(this, request, parent, isMain)
  }

  delete require.cache[routePath]
  try {
    return { router: require(`../routes/${routeName}`), routePath }
  } finally {
    Module._load = originalLoad
  }
}

async function requestRoute({ routeName, path = '/', method = 'GET', body, headers, modules }) {
  const app = express()
  if (!Buffer.isBuffer(body)) app.use(express.json())
  const { router, routePath } = loadRouter(routeName, modules)
  app.use(`/api/${routeName}`, router)
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance))
  })

  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/${routeName}${path}`, {
      method,
      headers: headers || (body === undefined ? undefined : { 'Content-Type': 'application/json' }),
      body: body === undefined ? undefined : Buffer.isBuffer(body) ? body : JSON.stringify(body),
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

function missingFileError() {
  return Object.assign(new Error('missing'), { code: 'ENOENT' })
}

test('article topic list returns topic rows', async () => {
  const rows = [{ id: 2, name: 'Node.js', articleCount: 3 }]
  const db = { query: (_sql, callback) => callback(null, rows) }

  const { response, body } = await requestRoute({ routeName: 'articleTopic', modules: { db } })

  assert.equal(response.status, 200)
  assert.deepEqual(body, rows)
})

test('article topic list reports a database error', async () => {
  const db = { query: (_sql, callback) => callback(new Error('database unavailable')) }

  const { response, body } = await requestRoute({ routeName: 'articleTopic', modules: { db } })

  assert.equal(response.status, 500)
  assert.equal(body, 'Server error')
})

test('article topic creation validates and normalizes input', async () => {
  const calls = []
  const db = {
    query(sql, params, callback) {
      calls.push({ sql, params })
      if (/^INSERT/.test(sql)) callback(null, { insertId: 8 })
      else callback(null, [{ id: 8, name: 'Node.js', description: 'Backend', articleCount: 0 }])
    },
  }

  const invalid = await requestRoute({
    routeName: 'articleTopic',
    method: 'POST',
    body: { name: '   ' },
    modules: { db },
  })
  assert.equal(invalid.response.status, 400)

  const created = await requestRoute({
    routeName: 'articleTopic',
    method: 'POST',
    body: { name: ' Node.js ', description: ' Backend ' },
    modules: { db },
  })
  assert.equal(created.response.status, 201)
  assert.equal(created.body.id, 8)
  assert.deepEqual(calls[0].params, ['Node.js', 'Backend'])
})

test('article topic creation reports duplicate names', async () => {
  const error = Object.assign(new Error('duplicate'), { code: 'ER_DUP_ENTRY' })
  const db = { query: (_sql, _params, callback) => callback(error) }

  const { response, body } = await requestRoute({
    routeName: 'articleTopic',
    method: 'POST',
    body: { name: 'Node.js' },
    modules: { db },
  })

  assert.equal(response.status, 409)
  assert.equal(body.message, '专题名称已存在')
})

test('article topic reorder rejects duplicate article ids before opening a transaction', async () => {
  let promiseCalled = false
  const db = { promise() { promiseCalled = true } }

  const { response, body } = await requestRoute({
    routeName: 'articleTopic',
    path: '/3/order',
    method: 'PUT',
    body: { articleIds: [7, 7] },
    modules: { db },
  })

  assert.equal(response.status, 400)
  assert.equal(body.message, '文章顺序中存在重复项')
  assert.equal(promiseCalled, false)
})

test('article topic reorder commits the requested order', async () => {
  const updates = []
  const transaction = { committed: false, rolledBack: false, released: false }
  const connection = {
    async beginTransaction() {},
    async query(sql, params) {
      if (/SELECT id/.test(sql)) return [[{ id: 7 }, { id: 9 }]]
      updates.push(params)
      return [{ affectedRows: 1 }]
    },
    async commit() { transaction.committed = true },
    async rollback() { transaction.rolledBack = true },
    release() { transaction.released = true },
  }
  const db = { promise: () => ({ getConnection: async () => connection }) }

  const { response, body } = await requestRoute({
    routeName: 'articleTopic',
    path: '/3/order',
    method: 'PUT',
    body: { articleIds: [9, 7] },
    modules: { db },
  })

  assert.equal(response.status, 200)
  assert.deepEqual(body, { articleIds: [9, 7] })
  assert.deepEqual(updates, [[1, 9, 3], [2, 7, 3]])
  assert.deepEqual(transaction, { committed: true, rolledBack: false, released: true })
})

test('article topic deletion refuses topics with articles', async () => {
  let calls = 0
  const db = {
    query(_sql, _params, callback) {
      calls += 1
      callback(null, [{ count: 2 }])
    },
  }

  const { response, body } = await requestRoute({
    routeName: 'articleTopic',
    path: '/?id=3',
    method: 'DELETE',
    modules: { db },
  })

  assert.equal(response.status, 409)
  assert.equal(body.message, '该专题仍有关联文章，无法删除')
  assert.equal(calls, 1)
})

test('public links list returns visible links', async () => {
  const rows = [{ id: 1, title: 'Example', state: 0 }]
  const db = { query: (_sql, callback) => callback(null, rows) }

  const { response, body } = await requestRoute({ routeName: 'link', modules: { db } })

  assert.equal(response.status, 200)
  assert.deepEqual(body, rows)
})

test('public links list reports a database error', async () => {
  const db = { query: (_sql, callback) => callback(new Error('database unavailable')) }

  const { response, body } = await requestRoute({ routeName: 'link', modules: { db } })

  assert.equal(response.status, 500)
  assert.equal(body, 'Server error')
})

test('admin links list reports a database error', async () => {
  const db = { query: (_sql, callback) => callback(new Error('database unavailable')) }

  const { response, body } = await requestRoute({ routeName: 'link', path: '/all', modules: { db } })

  assert.equal(response.status, 500)
  assert.equal(body, 'Server error')
})

test('link creation validates required fields and forwards normalized values', async () => {
  let insertParams
  const db = {
    query(_sql, params, callback) {
      insertParams = params
      callback(null, { insertId: 4 })
    },
  }

  const invalid = await requestRoute({
    routeName: 'link',
    method: 'POST',
    body: { params: { title: '', url: '' } },
    modules: { db },
  })
  assert.equal(invalid.response.status, 400)

  const created = await requestRoute({
    routeName: 'link',
    method: 'POST',
    body: { params: { title: 'Example', url: 'https://example.com', describe: 'Site', logo: 'logo.png' } },
    modules: { db },
  })
  assert.equal(created.response.status, 201)
  assert.deepEqual(insertParams, ['Example', 'https://example.com', 'Site', 'logo.png'])
})

test('link update rejects an empty update and deletion reports missing rows', async () => {
  const db = { query: (_sql, _params, callback) => callback(null, { affectedRows: 0 }) }

  const update = await requestRoute({
    routeName: 'link',
    method: 'PUT',
    body: { id: 9 },
    modules: { db },
  })
  assert.equal(update.response.status, 400)
  assert.equal(update.body, 'No fields to update')

  const deletion = await requestRoute({
    routeName: 'link',
    path: '/?id=9',
    method: 'DELETE',
    modules: { db },
  })
  assert.equal(deletion.response.status, 404)
  assert.equal(deletion.body, 'Link not found')
})

test('site statistics converts database counts to numbers', async () => {
  const db = { query: (_sql, callback) => callback(null, [{ pageViews: '21', uniqueVisitors: '6' }]) }

  const { response, body } = await requestRoute({ routeName: 'siteStatistics', modules: { db } })

  assert.equal(response.status, 200)
  assert.deepEqual(body, { pageViews: 21, uniqueVisitors: 6 })
})

test('site statistics reports a database error', async () => {
  const db = { query: (_sql, callback) => callback(new Error('database unavailable')) }

  const { response, body } = await requestRoute({ routeName: 'siteStatistics', modules: { db } })

  assert.equal(response.status, 500)
  assert.equal(body, 'Server error')
})

test('recording a page view commits visitor and page-view writes', async () => {
  const calls = []
  const state = { committed: false, released: false }
  const connection = {
    async beginTransaction() {},
    async query(sql, params) { calls.push({ sql, params }) },
    async commit() { state.committed = true },
    async rollback() {},
    release() { state.released = true },
  }
  const db = { promise: () => ({ getConnection: async () => connection }) }

  const { response, body } = await requestRoute({
    routeName: 'siteStatistics',
    path: '/view',
    method: 'POST',
    body: { visitorId: 'browser-id' },
    modules: { db },
  })

  assert.equal(response.status, 204)
  assert.equal(body, '')
  assert.deepEqual(calls[0].params, ['hash:browser-id'])
  assert.match(calls[1].sql, /ON DUPLICATE KEY UPDATE/)
  assert.deepEqual(state, { committed: true, released: true })
})

test('recording a page view rolls back and releases on failure', async () => {
  const state = { rolledBack: false, released: false }
  const connection = {
    async beginTransaction() {},
    async query() { throw new Error('write failed') },
    async commit() {},
    async rollback() { state.rolledBack = true },
    release() { state.released = true },
  }
  const db = { promise: () => ({ getConnection: async () => connection }) }

  const { response, body } = await requestRoute({
    routeName: 'siteStatistics',
    path: '/view',
    method: 'POST',
    body: { visitorId: 'browser-id' },
    modules: { db },
  })

  assert.equal(response.status, 500)
  assert.equal(body, 'Server error')
  assert.deepEqual(state, { rolledBack: true, released: true })
})

test('site notice falls back when its file is missing', async () => {
  const fs = { readFile: async () => { throw missingFileError() } }

  const { response, body } = await requestRoute({ routeName: 'siteNotice', modules: { fs } })

  assert.equal(response.status, 200)
  assert.match(body.content, /前端工程/)
  assert.equal(response.headers.get('cache-control'), 'no-store')
})

test('site notice update validates and atomically writes trimmed content', async () => {
  const calls = []
  const fs = {
    mkdir: async (...args) => calls.push(['mkdir', ...args]),
    writeFile: async (...args) => calls.push(['writeFile', ...args]),
    rename: async (...args) => calls.push(['rename', ...args]),
    rm: async () => {},
  }

  const invalid = await requestRoute({
    routeName: 'siteNotice',
    method: 'PUT',
    body: { content: '   ' },
    modules: { fs },
  })
  assert.equal(invalid.response.status, 400)

  const updated = await requestRoute({
    routeName: 'siteNotice',
    method: 'PUT',
    body: { content: '  New notice  ' },
    modules: { fs },
  })
  assert.equal(updated.response.status, 200)
  assert.deepEqual(updated.body, { content: 'New notice' })
  assert.equal(calls[1][0], 'writeFile')
  assert.match(calls[1][2], /New notice/)
  assert.equal(calls[2][0], 'rename')
})

test('site notice update removes its temporary file after a write failure', async () => {
  let removed = false
  const fs = {
    mkdir: async () => {},
    writeFile: async () => { throw new Error('disk full') },
    rename: async () => {},
    rm: async () => { removed = true },
  }

  const { response, body } = await requestRoute({
    routeName: 'siteNotice',
    method: 'PUT',
    body: { content: 'New notice' },
    modules: { fs },
  })

  assert.equal(response.status, 500)
  assert.equal(body, 'Server error')
  assert.equal(removed, true)
})

test('home content merges stored values with defaults', async () => {
  const fs = { readFile: async () => JSON.stringify({ title: 'Custom title' }) }

  const { response, body } = await requestRoute({ routeName: 'homeContent', modules: { fs } })

  assert.equal(response.status, 200)
  assert.equal(body.title, 'Custom title')
  assert.equal(body.authorName, '心中没有白月光')
})

test('home content update validates fields and writes normalized content', async () => {
  let written = ''
  const fs = {
    mkdir: async () => {},
    writeFile: async (_path, content) => { written = content },
    rename: async () => {},
    rm: async () => {},
  }
  const validContent = {
    eyebrow: ' Notes ',
    title: ' Clear answers ',
    authorName: ' Author ',
    description: ' Description ',
    typedTexts: [' Developer ', '', 'Writer'],
  }

  const invalid = await requestRoute({
    routeName: 'homeContent',
    method: 'PUT',
    body: { ...validContent, typedTexts: [] },
    modules: { fs },
  })
  assert.equal(invalid.response.status, 400)

  const updated = await requestRoute({
    routeName: 'homeContent',
    method: 'PUT',
    body: validContent,
    modules: { fs },
  })
  assert.equal(updated.response.status, 200)
  assert.deepEqual(updated.body.typedTexts, ['Developer', 'Writer'])
  assert.match(written, /Clear answers/)
})

test('about content falls back when its file is missing', async () => {
  const fs = { readFile: async () => { throw missingFileError() } }

  const { response, body } = await requestRoute({ routeName: 'about', modules: { fs } })

  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /text\/markdown/)
  assert.match(body, /关于我/)
})

test('about content update validates and atomically writes content', async () => {
  const calls = []
  const fs = {
    mkdir: async (...args) => calls.push(['mkdir', ...args]),
    writeFile: async (...args) => calls.push(['writeFile', ...args]),
    rename: async (...args) => calls.push(['rename', ...args]),
    rm: async () => {},
  }

  const invalid = await requestRoute({
    routeName: 'about',
    method: 'PUT',
    body: { content: '' },
    modules: { fs },
  })
  assert.equal(invalid.response.status, 400)

  const updated = await requestRoute({
    routeName: 'about',
    method: 'PUT',
    body: { content: '# Updated' },
    modules: { fs },
  })
  assert.equal(updated.response.status, 200)
  assert.equal(updated.body, 'About content updated')
  assert.equal(calls[1][2], '# Updated')
  assert.equal(calls[2][0], 'rename')
})

test('site background validates its type and reports missing files', async () => {
  const fs = { stat: async () => { throw missingFileError() } }

  const invalid = await requestRoute({ routeName: 'siteBackground', path: '/unknown/info', modules: { fs } })
  assert.equal(invalid.response.status, 404)

  const missing = await requestRoute({ routeName: 'siteBackground', path: '/home/info', modules: { fs } })
  assert.equal(missing.response.status, 200)
  assert.deepEqual(missing.body, { exists: false })
})

test('site background returns detected PNG content', async () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])
  const fs = { readFile: async () => png }

  const { response } = await requestRoute({ routeName: 'siteBackground', path: '/message', modules: { fs } })

  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /image\/png/)
})

test('site background upload rejects unsupported content types before writing', async () => {
  let writeCalled = false
  const fs = { writeFile: async () => { writeCalled = true } }

  const { response, body } = await requestRoute({
    routeName: 'siteBackground',
    path: '/home',
    method: 'PUT',
    body: Buffer.from('not an image'),
    headers: { 'Content-Type': 'text/plain' },
    modules: { fs },
  })

  assert.equal(response.status, 415)
  assert.equal(body, 'Unsupported image type')
  assert.equal(writeCalled, false)
})

test('site background upload atomically replaces a valid image', async () => {
  const calls = []
  const updatedAt = new Date('2026-09-14T00:00:00.000Z')
  const fs = {
    mkdir: async (...args) => calls.push(['mkdir', ...args]),
    writeFile: async (...args) => calls.push(['writeFile', ...args]),
    rename: async (...args) => calls.push(['rename', ...args]),
    stat: async () => ({ size: 9, mtime: updatedAt }),
    rm: async () => {},
  }
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])

  const { response, body } = await requestRoute({
    routeName: 'siteBackground',
    path: '/home',
    method: 'PUT',
    body: png,
    headers: { 'Content-Type': 'image/png' },
    modules: { fs },
  })

  assert.equal(response.status, 200)
  assert.deepEqual(body, {
    exists: true,
    size: 9,
    updatedAt: updatedAt.toISOString(),
    url: '/api/site-background/home',
  })
  assert.equal(calls[1][0], 'writeFile')
  assert.equal(calls[2][0], 'rename')
})
