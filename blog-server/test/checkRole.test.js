const test = require('node:test')
const assert = require('node:assert/strict')
const jwt = require('jsonwebtoken')
const key = require('../config/key')
const checkRole = require('../middleware/checkRole')

function createToken(role) {
  return jwt.sign({ id: 1, username: `${role}-tester`, role }, key, { expiresIn: '5m' })
}

function invoke({ method = 'GET', token, ip = '127.0.0.10' } = {}) {
  return new Promise((resolve) => {
    const headers = {}
    const req = {
      method,
      ip,
      socket: {},
      get(name) {
        return name === 'Authorization' ? token : undefined
      },
    }
    const result = { statusCode: 200, body: undefined, nextCalled: false, req }
    const res = {
      set(name, value) {
        headers[name] = value
        return this
      },
      status(value) {
        result.statusCode = value
        return this
      },
      send(value) {
        result.body = value
        result.headers = headers
        resolve(result)
        return this
      },
    }

    checkRole(req, res, () => {
      result.nextCalled = true
      result.headers = headers
      resolve(result)
    })
  })
}

test('rejects requests without a valid token', async () => {
  const missing = await invoke()
  const invalid = await invoke({ token: 'invalid-token' })

  assert.equal(missing.statusCode, 401)
  assert.equal(missing.nextCalled, false)
  assert.equal(invalid.statusCode, 401)
  assert.equal(invalid.nextCalled, false)
})

test('allows viewers to read but rejects writes', async () => {
  const token = createToken('viewer')
  const read = await invoke({ token })
  const write = await invoke({ method: 'PUT', token })

  assert.equal(read.nextCalled, true)
  assert.equal(read.req.user.role, 'viewer')
  assert.equal(write.statusCode, 403)
  assert.equal(write.nextCalled, false)
})

test('rejects ordinary users from admin routes', async () => {
  const result = await invoke({ token: createToken('user') })

  assert.equal(result.statusCode, 403)
  assert.equal(result.nextCalled, false)
})

test('allows administrators to read and write', async () => {
  const token = createToken('admin')
  const read = await invoke({ token })
  const write = await invoke({ method: 'POST', token, ip: '127.0.0.11' })

  assert.equal(read.nextCalled, true)
  assert.equal(write.nextCalled, true)
  assert.equal(write.headers['RateLimit-Limit'], '30')
})
