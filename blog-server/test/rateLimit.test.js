const test = require('node:test')
const assert = require('node:assert/strict')
const { createRateLimiter } = require('../middleware/rateLimit')

function invoke(limiter, ip) {
  const headers = {}
  let statusCode = 200
  let body
  let nextCalled = false
  const req = { ip, method: 'GET', socket: {} }
  const res = {
    set(name, value) {
      headers[name] = value
      return this
    },
    status(value) {
      statusCode = value
      return this
    },
    send(value) {
      body = value
      return this
    },
  }

  limiter(req, res, () => {
    nextCalled = true
  })
  return { headers, statusCode, body, nextCalled }
}

test('blocks requests over the limit and returns retry metadata', () => {
  const limiter = createRateLimiter({ windowMs: 60 * 1000, max: 2 })

  assert.equal(invoke(limiter, '127.0.0.1').nextCalled, true)
  assert.equal(invoke(limiter, '127.0.0.1').nextCalled, true)
  const blocked = invoke(limiter, '127.0.0.1')

  assert.equal(blocked.statusCode, 429)
  assert.equal(blocked.nextCalled, false)
  assert.equal(blocked.headers['RateLimit-Remaining'], '0')
  assert.ok(Number(blocked.headers['Retry-After']) > 0)
  assert.equal(blocked.headers['RateLimit-Reset'], blocked.headers['Retry-After'])
  assert.equal(blocked.body.message, '请求过于频繁，请稍后重试')
})

test('tracks different IP addresses independently', () => {
  const limiter = createRateLimiter({ windowMs: 60 * 1000, max: 1 })

  assert.equal(invoke(limiter, '127.0.0.1').nextCalled, true)
  assert.equal(invoke(limiter, '127.0.0.2').nextCalled, true)
  assert.equal(invoke(limiter, '127.0.0.1').statusCode, 429)
})
