const test = require('node:test')
const assert = require('node:assert/strict')

const { runSmokeTest } = require('../../scripts/smoke-test')

function createResponse({ status = 200, contentType = '', json, text = '' }) {
  return {
    status,
    headers: {
      get: (name) => name.toLowerCase() === 'content-type' ? contentType : null,
    },
    json: async () => json,
    text: async () => text,
  }
}

test('deployment smoke test verifies health, release, homepage, and a static asset', async () => {
  const requestedUrls = []
  const responses = [
    createResponse({ json: { status: 'ok', database: 'ok', release: 'abc123' } }),
    createResponse({
      contentType: 'text/html; charset=utf-8',
      text: '<html><script src="/blog/assets/index.js"></script></html>',
    }),
    createResponse({ contentType: 'application/javascript' }),
  ]

  const result = await runSmokeTest({
    baseUrl: 'http://127.0.0.1:8080/',
    expectedRelease: 'abc123',
    fetchImpl: async (url) => {
      requestedUrls.push(String(url))
      return responses.shift()
    },
  })

  assert.deepEqual(requestedUrls, [
    'http://127.0.0.1:8080/api/health',
    'http://127.0.0.1:8080/',
    'http://127.0.0.1:8080/blog/assets/index.js',
  ])
  assert.equal(result.release, 'abc123')
})

test('deployment smoke test rejects a stale release', async () => {
  await assert.rejects(
    runSmokeTest({
      expectedRelease: 'new-release',
      fetchImpl: async () => createResponse({
        json: { status: 'ok', database: 'ok', release: 'old-release' },
      }),
    }),
    /部署版本不一致/,
  )
})

test('deployment smoke test rejects a homepage without built assets', async () => {
  const responses = [
    createResponse({ json: { status: 'ok', database: 'ok', release: 'abc123' } }),
    createResponse({ contentType: 'text/html', text: '<html><body>empty</body></html>' }),
  ]

  await assert.rejects(
    runSmokeTest({ fetchImpl: async () => responses.shift() }),
    /没有引用可验证的 JS 或 CSS 资源/,
  )
})
