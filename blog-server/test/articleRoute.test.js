const test = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const express = require('express')

const articleRoutePath = require.resolve('../routes/article')

function loadArticleRouter(db) {
  const originalLoad = Module._load
  const passThrough = (_req, _res, next) => next()

  Module._load = function (request, parent, isMain) {
    if (request === '@utils/mysqlUtils') return db
    if (request === '@utils/articleDataProcessing') return (data) => data
    if (request === '@utils/visitorId') return (visitorId) => visitorId ? `hash:${visitorId}` : ''
    if (request === '@middleware/checkRole') return passThrough
    if (request === '@middleware/rateLimit') {
      return { likeLimiter: passThrough, uploadLimiter: passThrough }
    }
    return originalLoad.call(this, request, parent, isMain)
  }

  delete require.cache[articleRoutePath]
  try {
    return require('../routes/article')
  } finally {
    Module._load = originalLoad
  }
}

async function requestArticle({ path = '/', method = 'GET', body, db }) {
  const app = express()
  app.use(express.json())
  app.use('/api/article', loadArticleRouter(db))
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance))
  })

  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/article${path}`, {
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
    delete require.cache[articleRoutePath]
  }
}

test('article list returns paginated data and a numeric total', async () => {
  const calls = []
  const db = {
    query(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params
        params = []
      }
      calls.push({ sql, params })
      if (/COUNT\(\*\)/.test(sql)) callback(null, [{ total: '7' }])
      else callback(null, [{ id: 3, title: 'Test article' }])
    },
  }

  const { response, body } = await requestArticle({ path: '/?page=2&pageSize=3', db })

  assert.equal(response.status, 200)
  assert.deepEqual(body, { list: [{ id: 3, title: 'Test article' }], total: 7 })
  assert.deepEqual(calls[1].params, [3, 3])
})

test('complete public article list returns visible articles without pagination', async () => {
  let receivedSql = ''
  const articles = [{ id: 1, title: 'First' }, { id: 2, title: 'Second' }]
  const db = {
    query(sql, callback) {
      receivedSql = sql
      callback(null, articles)
    },
  }

  const { response, body } = await requestArticle({ path: '/?allList=true', db })

  assert.equal(response.status, 200)
  assert.deepEqual(body, articles)
  assert.match(receivedSql, /WHERE a\.hidden = 0/)
  assert.doesNotMatch(receivedSql, /LIMIT/)
})

test('article navigation rejects an invalid article id without querying the database', async () => {
  let queryCalled = false
  const { response, body } = await requestArticle({
    path: '/navigation?id=invalid',
    db: { query() { queryCalled = true } },
  })

  assert.equal(response.status, 400)
  assert.equal(body.message, '文章 ID 无效')
  assert.equal(queryCalled, false)
})

test('article navigation returns adjacent articles in the same topic', async () => {
  let queryCount = 0
  const db = {
    query(_sql, params, callback) {
      queryCount += 1
      if (queryCount === 1) {
        callback(null, [{ id: 8, topicId: 3, topicName: 'Node.js' }])
      } else {
        assert.deepEqual(params, [3])
        callback(null, [
          { id: 7, title: 'Previous' },
          { id: 8, title: 'Current' },
          { id: 9, title: 'Next' },
        ])
      }
    },
  }

  const { response, body } = await requestArticle({ path: '/navigation?id=8', db })

  assert.equal(response.status, 200)
  assert.deepEqual(body, {
    topic: { id: 3, name: 'Node.js' },
    position: 2,
    total: 3,
    previous: { id: 7, title: 'Previous' },
    next: { id: 9, title: 'Next' },
  })
})

test('article likes endpoint returns a numeric count', async () => {
  const db = {
    query(_sql, params, callback) {
      assert.deepEqual(params, [4])
      callback(null, [{ id: 4, likes: '12' }])
    },
  }

  const { response, body } = await requestArticle({ path: '/likes?id=4', db })

  assert.equal(response.status, 200)
  assert.deepEqual(body, { likes: 12 })
})

test('article like uses a hashed visitor id and returns the current count', async () => {
  const calls = []
  const db = {
    query(sql, params, callback) {
      calls.push({ sql, params })
      if (/INSERT IGNORE/.test(sql)) callback(null, { affectedRows: 1 })
      else callback(null, [{ id: 4, likes: '12' }])
    },
  }

  const { response, body } = await requestArticle({
    path: '/like',
    method: 'POST',
    body: { articleId: 4, visitorId: 'browser-id' },
    db,
  })

  assert.equal(response.status, 200)
  assert.deepEqual(body, { likes: 12, liked: true })
  assert.deepEqual(calls[0].params, ['hash:browser-id', 4])
})

test('article creation validates relations and commits normalized values', async () => {
  const queries = []
  const transaction = { began: false, committed: false, rolledBack: false, released: false }
  const connection = {
    async beginTransaction() { transaction.began = true },
    async query(sql, params) {
      queries.push({ sql, params })
      if (/SELECT id FROM label/.test(sql)) return [[{ id: 1 }, { id: 2 }]]
      if (/SELECT id FROM article_topic/.test(sql)) return [[{ id: 3 }]]
      return [{ insertId: 9 }]
    },
    async commit() { transaction.committed = true },
    async rollback() { transaction.rolledBack = true },
    release() { transaction.released = true },
  }
  const db = { promise: () => ({ getConnection: async () => connection }) }

  const { response, body } = await requestArticle({
    method: 'POST',
    body: {
      title: 'New article',
      article: 'article.md',
      labelIds: [2, 2, 1],
      topicId: 3,
      topicOrder: 2,
      topping: true,
    },
    db,
  })

  assert.equal(response.status, 201)
  assert.equal(body, 'Article created')
  assert.deepEqual(transaction, { began: true, committed: true, rolledBack: false, released: true })
  assert.deepEqual(queries[0].params, [[2, 1]])
  assert.deepEqual(queries[1].params, [3])
  assert.equal(queries[2].params[3], '2,1')
  assert.equal(queries[2].params[4], 3)
  assert.equal(queries[2].params[5], 2)
  assert.equal(queries[2].params[7], 1)
})

test('article creation rejects missing required fields before opening a transaction', async () => {
  let promiseCalled = false
  const { response, body } = await requestArticle({
    method: 'POST',
    body: { title: 'Missing article path' },
    db: { promise() { promiseCalled = true } },
  })

  assert.equal(response.status, 400)
  assert.equal(body, 'Incorrect fields')
  assert.equal(promiseCalled, false)
})

test('article deletion reports a missing article', async () => {
  const db = {
    query(_sql, params, callback) {
      assert.deepEqual(params, ['99'])
      callback(null, { affectedRows: 0 })
    },
  }

  const { response, body } = await requestArticle({
    path: '/?id=99',
    method: 'DELETE',
    db,
  })

  assert.equal(response.status, 404)
  assert.equal(body, 'Article not found')
})

test('article update rejects an empty update before opening a transaction', async () => {
  let promiseCalled = false
  const { response, body } = await requestArticle({
    method: 'PUT',
    body: { id: 3, unsupported: 'ignored' },
    db: { promise() { promiseCalled = true } },
  })

  assert.equal(response.status, 400)
  assert.equal(body, 'No fields to update')
  assert.equal(promiseCalled, false)
})

test('article upload rejects an unsafe filename before writing a file', async () => {
  const { response, body } = await requestArticle({
    path: '/upload',
    method: 'POST',
    body: { title: '../unsafe', content: 'content' },
    db: {},
  })

  assert.equal(response.status, 400)
  assert.equal(body, 'Invalid article file')
})
