const test = require('node:test')
const assert = require('node:assert/strict')
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
