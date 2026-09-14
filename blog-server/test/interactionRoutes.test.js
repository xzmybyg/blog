const test = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const express = require('express')

function loadRouter(routeName, db, user = { id: 17, role: 'user' }) {
  const routePath = require.resolve(`../routes/${routeName}`)
  const originalLoad = Module._load
  const passThrough = (_req, _res, next) => next()

  Module._load = function (request, parent, isMain) {
    if (request === '@utils/mysqlUtils') return db
    if (request === '@middleware/checkRole') return passThrough
    if (request === '@middleware/checkToken') {
      return (req, _res, next) => {
        req.user = user
        next()
      }
    }
    if (request === '@middleware/rateLimit') {
      return { interactionLimiter: passThrough, likeLimiter: passThrough }
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

async function requestRoute({ routeName, path = '/', method = 'GET', body, db, user }) {
  const app = express()
  app.use(express.json())
  const { router, routePath } = loadRouter(routeName, db, user)
  app.use(`/api/${routeName}`, router)
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance))
  })

  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/${routeName}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
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

test('comment list groups replies under their parent comment', async () => {
  const rows = [
    {
      id: 5,
      content: 'Comment',
      user_id: 2,
      username: 'reader',
      user_nickName: 'Reader',
      article_id: 8,
      reply_id: 11,
      reply_content: 'First reply',
      reply_user_id: 3,
      reply_username: 'author',
    },
    {
      id: 5,
      content: 'Comment',
      user_id: 2,
      username: 'reader',
      user_nickName: 'Reader',
      article_id: 8,
      reply_id: 12,
      reply_content: 'Second reply',
      reply_user_id: 4,
      reply_username: 'guest',
    },
  ]
  const db = { query: (_sql, params, callback) => callback(null, rows) }

  const { response, body } = await requestRoute({ routeName: 'comment', path: '/?id=8', db })

  assert.equal(response.status, 200)
  assert.equal(body.length, 1)
  assert.equal(body[0].comment_id, 5)
  assert.deepEqual(body[0].replyList.map((reply) => reply.reply_id), [11, 12])
})

test('creating a comment trusts the authenticated user instead of a body user id', async () => {
  let insertParams
  const db = {
    query(_sql, params, callback) {
      insertParams = params
      callback(null, { insertId: 21 })
    },
  }

  const { response, body } = await requestRoute({
    routeName: 'comment',
    method: 'POST',
    body: { params: { article_id: 8, user_id: 999, content: 'Hello' } },
    user: { id: 17, role: 'user' },
    db,
  })

  assert.equal(response.status, 200)
  assert.equal(body.user_id, 17)
  assert.deepEqual(insertParams.slice(0, 3), [17, 8, 'Hello'])
})

test('comment like update forwards only the like count and comment id', async () => {
  let updateParams
  const db = {
    query(_sql, params, callback) {
      updateParams = params
      callback(null, { affectedRows: 1 })
    },
  }

  const { response, body } = await requestRoute({
    routeName: 'comment',
    method: 'PUT',
    body: { params: { id: 5, like: 9, user_id: 999 } },
    db,
  })

  assert.equal(response.status, 200)
  assert.equal(body, 'ok')
  assert.deepEqual(updateParams, [9, 5])
})

test('comment deletion forwards the selected id', async () => {
  let deleteParams
  const db = {
    query(_sql, params, callback) {
      deleteParams = params
      callback(null, { affectedRows: 1 })
    },
  }

  const { response, body } = await requestRoute({
    routeName: 'comment',
    path: '/?id=5',
    method: 'DELETE',
    db,
  })

  assert.equal(response.status, 200)
  assert.equal(body, 'ok')
  assert.deepEqual(deleteParams, ['5'])
})

test('message list returns public messages', async () => {
  const messages = [{ id: 1, content: 'Hello' }]
  const db = { query: (_sql, callback) => callback(null, messages) }

  const { response, body } = await requestRoute({ routeName: 'message', db })

  assert.equal(response.status, 200)
  assert.deepEqual(body, messages)
})

test('creating a message trusts the authenticated user instead of a body user id', async () => {
  let insertParams
  const db = {
    query(_sql, params, callback) {
      insertParams = params
      callback(null, { insertId: 31 })
    },
  }

  const { response, body } = await requestRoute({
    routeName: 'message',
    method: 'POST',
    body: { user_id: 999, content: 'A message' },
    user: { id: 17, role: 'user' },
    db,
  })

  assert.equal(response.status, 200)
  assert.equal(body.id, 31)
  assert.equal(body.user_id, 17)
  assert.deepEqual(insertParams.slice(0, 2), [17, 'A message'])
})

test('admin message list includes user information from the query result', async () => {
  const messages = [{ id: 1, content: 'Hello', username: 'reader', nickname: 'Reader' }]
  const db = { query: (_sql, callback) => callback(null, messages) }

  const { response, body } = await requestRoute({
    routeName: 'message',
    path: '/admin',
    db,
  })

  assert.equal(response.status, 200)
  assert.deepEqual(body, messages)
})

test('message deletion forwards the selected id', async () => {
  let deleteParams
  const db = {
    query(_sql, params, callback) {
      deleteParams = params
      callback(null, { affectedRows: 1 })
    },
  }

  const { response, body } = await requestRoute({
    routeName: 'message',
    path: '/?id=31',
    method: 'DELETE',
    db,
  })

  assert.equal(response.status, 200)
  assert.equal(body, 'Message deleted')
  assert.deepEqual(deleteParams, ['31'])
})
