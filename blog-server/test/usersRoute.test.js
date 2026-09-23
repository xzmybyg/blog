const test = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const express = require('express')
const jwt = require('jsonwebtoken')

const usersRoutePath = require.resolve('../routes/users')
const testKey = 'test-only-jwt-secret'

function loadUsersRouter(query, user = { id: 1, role: 'user' }) {
  const originalLoad = Module._load
  const passThrough = (_req, _res, next) => next()

  Module._load = function (request, parent, isMain) {
    if (request === '@utils/mysqlUtils') return { query }
    if (request === '@config/key') return testKey
    if (request === '@middleware/checkRole') return passThrough
    if (request === '@middleware/checkToken') {
      return (req, _res, next) => {
        req.user = user
        next()
      }
    }
    if (request === '@middleware/rateLimit') {
      return {
        loginLimiter: passThrough,
        registerLimiter: passThrough,
        passwordResetRequestLimiter: passThrough,
        passwordResetConfirmLimiter: passThrough,
        authenticatedWriteLimiter: passThrough,
        uploadLimiter: passThrough,
      }
    }
    return originalLoad.call(this, request, parent, isMain)
  }

  delete require.cache[usersRoutePath]
  try {
    return require('../routes/users')
  } finally {
    Module._load = originalLoad
  }
}

async function requestUsers({ path = '/login', method = 'POST', body, query, user }) {
  const app = express()
  app.use(express.json())
  app.use('/api/users', loadUsersRouter(query, user))

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance))
  })

  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/users${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    delete require.cache[usersRoutePath]
  }
}

test('login validates required credentials before querying the database', async () => {
  let queryCalled = false
  const { response, body } = await requestUsers({
    body: { username: '', password: '' },
    query() { queryCalled = true },
  })

  assert.equal(response.status, 400)
  assert.equal(queryCalled, false)
})

test('login returns a signed token without exposing a password', async () => {
  const calls = []
  const account = {
    id: 7,
    username: 'reader',
    role: 'viewer',
    avatar: '',
    nickname: 'Reader',
    commentLimit: 1,
    email: 'reader@example.com',
    password: 'secret',
  }
  const { response, body } = await requestUsers({
    body: { username: ' reader ', password: 'secret' },
    query(sql, params, callback) {
      calls.push({ sql, params })
      callback(null, [account])
    },
  })

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.deepEqual(calls[0].params, ['reader'])
  assert.equal(body.password, undefined)
  assert.equal(jwt.verify(body.token, testKey).role, 'viewer')
})

test('registration rejects an existing username without inserting a row', async () => {
  const calls = []
  const { response, body } = await requestUsers({
    path: '/',
    body: { username: ' existing ', password: 'secret123', email: 'user@example.com' },
    query(sql, params, callback) {
      calls.push({ sql, params })
      callback(null, [{ username: 'existing', email: 'another@example.com' }])
    },
  })

  assert.equal(response.status, 409)
  assert.equal(body.message, '该账号已存在，请直接登录')
  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0].params, ['existing', 'user@example.com'])
})

test('registration rejects an email that is already registered', async () => {
  const { response, body } = await requestUsers({
    path: '/',
    body: { username: 'new-user', password: 'secret123', email: ' Existing@Example.com ' },
    query(_sql, params, callback) {
      assert.deepEqual(params, ['new-user', 'existing@example.com'])
      callback(null, [{ username: 'another-user', email: 'existing@example.com' }])
    },
  })

  assert.equal(response.status, 409)
  assert.equal(body.message, '该邮箱已注册，请直接登录或找回密码')
})

test('registration converts a duplicate insert race into a conflict', async () => {
  let callCount = 0
  const { response, body } = await requestUsers({
    path: '/',
    body: { username: 'new-user', password: 'secret123', email: 'user@example.com' },
    query(_sql, _params, callback) {
      callCount += 1
      if (callCount === 1) callback(null, [])
      else callback({ code: 'ER_DUP_ENTRY', sqlMessage: "Duplicate entry for key 'uq_user_email'" })
    },
  })

  assert.equal(response.status, 409)
  assert.equal(body.message, '该邮箱已注册，请直接登录或找回密码')
  assert.equal(callCount, 2)
})

test('ordinary users can update only their own allowed profile fields', async () => {
  let update
  const { response } = await requestUsers({
    path: '/',
    method: 'PUT',
    user: { id: 5, role: 'user' },
    body: { id: 99, nickname: 'New name', email: 'blocked@example.com', role: 'admin' },
    query(sql, params, callback) {
      update = { sql, params }
      callback(null, { affectedRows: 1 })
    },
  })

  assert.equal(response.status, 200)
  assert.match(update.sql, /nickname = \?/)
  assert.doesNotMatch(update.sql, /email|role/)
  assert.deepEqual(update.params, ['New name', 5])
})

test('authenticated users can load their own profile', async () => {
  const profile = {
    id: 5,
    username: 'reader',
    role: 'user',
    avatar: '',
    nickname: 'Reader',
    commentLimit: 1,
    email: 'reader@example.com',
  }
  const { response, body } = await requestUsers({
    path: '/me',
    method: 'GET',
    user: { id: 5, role: 'user' },
    query(sql, params, callback) {
      assert.match(sql, /FROM user WHERE id = \?/)
      assert.deepEqual(params, [5])
      callback(null, [profile])
    },
  })

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.deepEqual(body, profile)
})

test('profile updates reject invalid avatar URLs before querying the database', async () => {
  let queryCalled = false
  const { response } = await requestUsers({
    path: '/',
    method: 'PUT',
    user: { id: 5, role: 'user' },
    body: { avatar: 'javascript:alert(1)' },
    query() { queryCalled = true },
  })

  assert.equal(response.status, 400)
  assert.equal(queryCalled, false)
})

test('viewers cannot update users', async () => {
  let queryCalled = false
  const { response } = await requestUsers({
    path: '/',
    method: 'PUT',
    user: { id: 8, role: 'viewer' },
    body: { nickname: 'Blocked' },
    query() { queryCalled = true },
  })

  assert.equal(response.status, 403)
  assert.equal(queryCalled, false)
})

test('administrators cannot assign an unknown role', async () => {
  let queryCalled = false
  const { response } = await requestUsers({
    path: '/',
    method: 'PUT',
    user: { id: 1, role: 'admin' },
    body: { id: 9, role: 'owner' },
    query() { queryCalled = true },
  })

  assert.equal(response.status, 400)
  assert.equal(queryCalled, false)
})
