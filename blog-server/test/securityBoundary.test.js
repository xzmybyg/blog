const test = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const express = require('express')
const jwt = require('jsonwebtoken')

const testKey = 'test-only-jwt-secret'

function loadCheckToken() {
  const modulePath = require.resolve('../middleware/checkToken')
  const originalLoad = Module._load

  Module._load = function (request, parent, isMain) {
    if (request === '../config/key') return testKey
    return originalLoad.call(this, request, parent, isMain)
  }

  delete require.cache[modulePath]
  try {
    return require('../middleware/checkToken')
  } finally {
    Module._load = originalLoad
  }
}

function invokeCheckToken(checkToken, token) {
  return new Promise((resolve) => {
    const req = {
      get(name) {
        return name === 'Authorization' ? token : undefined
      },
    }
    const result = { statusCode: 200, body: undefined, nextCalled: false, req }
    const res = {
      status(value) {
        result.statusCode = value
        return this
      },
      send(value) {
        result.body = value
        resolve(result)
        return this
      },
    }

    checkToken(req, res, () => {
      result.nextCalled = true
      resolve(result)
    })
  })
}

async function withRateLimitServer(run) {
  const { createRateLimiter } = require('../middleware/rateLimit')
  const app = express()
  app.set('trust proxy', 1)
  app.use(createRateLimiter({ windowMs: 60 * 1000, max: 1 }))
  app.all('/probe', (_req, res) => res.sendStatus(204))

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance))
  })

  try {
    await run(`http://127.0.0.1:${server.address().port}/probe`)
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  }
}

function loadAppForCorsTest() {
  const appPath = require.resolve('../app')
  const originalLoad = Module._load
  const emptyRouter = express.Router()
  const corsProbeRouter = express.Router()
  corsProbeRouter.options('/probe', (_req, res) => res.sendStatus(204))
  const passThrough = (_req, _res, next) => next()

  Module._load = function (request, parent, isMain) {
    if (request === '@routes/users') return corsProbeRouter
    if (request.startsWith('@routes/')) return emptyRouter
    if (request === '@utils/mysqlUtils') return {}
    if (request === '@middleware/requestContext') return passThrough
    if (request === '@middleware/rateLimit') return { globalApiLimiter: passThrough }
    if (request === '@utils/errorMonitor') return { reportServerError: () => 'test-error-id' }
    return originalLoad.call(this, request, parent, isMain)
  }

  delete require.cache[appPath]
  try {
    return require('../app')
  } finally {
    Module._load = originalLoad
  }
}

test('checkToken accepts a valid token and exposes only its verified claims', async () => {
  const checkToken = loadCheckToken()
  const token = jwt.sign({ id: 7, role: 'viewer' }, testKey, { expiresIn: '5m' })
  const result = await invokeCheckToken(checkToken, token)

  assert.equal(result.nextCalled, true)
  assert.equal(result.req.user.id, 7)
  assert.equal(result.req.user.role, 'viewer')
})

test('checkToken rejects missing, tampered, and expired tokens', async () => {
  const checkToken = loadCheckToken()
  const valid = jwt.sign({ id: 7, role: 'viewer' }, testKey, { expiresIn: '5m' })
  const expired = jwt.sign({ id: 7, role: 'viewer' }, testKey, { expiresIn: -1 })

  for (const token of [undefined, `${valid}tampered`, expired]) {
    const result = await invokeCheckToken(checkToken, token)
    assert.equal(result.statusCode, 401)
    assert.equal(result.body, 'Unauthorized')
    assert.equal(result.nextCalled, false)
    assert.equal(result.req.user, undefined)
  }
})

test('visitor identifiers are normalized and hashed deterministically', () => {
  const hashVisitorId = require('../utils/visitorId')
  const first = hashVisitorId(' browser-id ')
  const second = hashVisitorId('browser-id')

  assert.equal(first, second)
  assert.match(first, /^[a-f0-9]{64}$/)
  assert.notEqual(first, 'browser-id')
})

test('invalid or oversized visitor identifiers are discarded', () => {
  const hashVisitorId = require('../utils/visitorId')

  for (const value of [undefined, null, 123, '', '   ', 'x'.repeat(129)]) {
    assert.equal(hashVisitorId(value), '')
  }
  assert.match(hashVisitorId('x'.repeat(128)), /^[a-f0-9]{64}$/)
})

test('rate limiting uses the nearest forwarded address and ignores spoofed prefixes', async () => {
  await withRateLimitServer(async (url) => {
    const first = await fetch(url, { headers: { 'X-Forwarded-For': '198.51.100.10, 203.0.113.7' } })
    const spoofChanged = await fetch(url, { headers: { 'X-Forwarded-For': '198.51.100.11, 203.0.113.7' } })
    const clientChanged = await fetch(url, { headers: { 'X-Forwarded-For': '198.51.100.10, 203.0.113.8' } })

    assert.equal(first.status, 204)
    assert.equal(spoofChanged.status, 429)
    assert.equal(clientChanged.status, 204)
  })
})

test('CORS preflight requests do not consume the rate limit', async () => {
  await withRateLimitServer(async (url) => {
    const preflight = await fetch(url, { method: 'OPTIONS' })
    const firstRequest = await fetch(url)
    const blockedRequest = await fetch(url)

    assert.equal(preflight.status, 204)
    assert.equal(firstRequest.status, 204)
    assert.equal(blockedRequest.status, 429)
  })
})

test('API responses expose the configured CORS and rate-limit headers', async () => {
  const app = loadAppForCorsTest()
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance))
  })

  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/users/probe`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://www.xzmybyg.cn',
        'Access-Control-Request-Headers': 'authorization,content-type',
        'Access-Control-Request-Method': 'POST',
      },
    })

    assert.equal(response.headers.get('access-control-allow-origin'), '*')
    assert.match(response.headers.get('access-control-allow-methods'), /POST/)
    assert.match(response.headers.get('access-control-allow-headers'), /Authorization/i)
    assert.match(response.headers.get('access-control-expose-headers'), /RateLimit-Remaining/i)
    assert.match(response.headers.get('access-control-expose-headers'), /X-Request-Id/i)
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    delete require.cache[require.resolve('../app')]
  }
})
