const test = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const { normalizeError } = require('../utils/errorMonitor')

test('normalizes client errors without retaining URL queries or sensitive context', () => {
  const error = normalizeError({
    source: 'client',
    message: 'Render failed',
    route: '/message?token=secret',
    method: 'get',
    statusCode: 500,
    context: {
      componentStack: 'MessagePage',
      password: 'must-not-be-stored',
    },
  })

  assert.equal(error.route, '/message')
  assert.equal(error.method, 'GET')
  assert.equal(error.statusCode, 500)
  assert.deepEqual(JSON.parse(error.contextJson), { componentStack: 'MessagePage' })
})

test('uses a stable fingerprint for equivalent errors', () => {
  const first = normalizeError({ source: 'server', message: 'Database failed', route: '/api/article?id=1' })
  const second = normalizeError({ source: 'server', message: 'Database failed', route: '/api/article?id=2' })

  assert.equal(first.fingerprint, second.fingerprint)
  assert.notEqual(first.requestId, second.requestId)
})

test('normalizes unsupported values and enforces storage limits', () => {
  const error = normalizeError({
    source: 'unknown',
    level: 'fatal',
    message: 'x'.repeat(1100),
    stack: 's'.repeat(17000),
    method: 'unexpected-method',
    statusCode: 99,
    requestId: 'r'.repeat(80),
    userAgent: 'u'.repeat(600),
  })

  assert.equal(error.source, 'server')
  assert.equal(error.level, 'fatal')
  assert.equal(error.message.length, 1000)
  assert.equal(error.stack.length, 16000)
  assert.equal(error.method.length, 10)
  assert.equal(error.statusCode, null)
  assert.equal(error.requestId.length, 64)
  assert.equal(error.userAgent.length, 500)
})

test('recordError absorbs database failures and still returns its request id', async () => {
  const originalLoad = Module._load
  const originalConsoleError = console.error
  const logs = []
  Module._load = function (request, parent, isMain) {
    if (request === './mysqlUtils') {
      return { promise: () => ({ query: async () => { throw new Error('database unavailable') } }) }
    }
    return originalLoad.call(this, request, parent, isMain)
  }
  console.error = (message) => logs.push(message)

  try {
    const { recordError } = require('../utils/errorMonitor')
    const requestId = await recordError({ message: 'Failure', requestId: 'known-request-id' })

    assert.equal(requestId, 'known-request-id')
    assert.equal(logs.length, 2)
    assert.match(logs[1], /数据库写入失败|写入数据库失败/)
  } finally {
    Module._load = originalLoad
    console.error = originalConsoleError
  }
})
