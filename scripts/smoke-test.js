// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('node:assert/strict')

const DEFAULT_BASE_URL = 'http://127.0.0.1:8080'
const DEFAULT_TIMEOUT_MS = 10000

function normalizeBaseUrl(baseUrl) {
  return baseUrl.replace(/\/+$/, '')
}

async function fetchWithTimeout(fetchImpl, url, timeoutMs) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetchImpl(url, {
      headers: { Accept: '*/*' },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function runSmokeTest({
  baseUrl = DEFAULT_BASE_URL,
  expectedRelease = '',
  timeoutMs = DEFAULT_TIMEOUT_MS,
  fetchImpl = globalThis.fetch,
} = {}) {
  assert.equal(typeof fetchImpl, 'function', '当前 Node.js 版本不支持 fetch')

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)
  const healthResponse = await fetchWithTimeout(
    fetchImpl,
    `${normalizedBaseUrl}/api/health`,
    timeoutMs,
  )
  assert.equal(healthResponse.status, 200, `健康检查返回 HTTP ${healthResponse.status}`)

  const health = await healthResponse.json()
  assert.equal(health.status, 'ok', '应用健康状态不是 ok')
  assert.equal(health.database, 'ok', '数据库健康状态不是 ok')
  if (expectedRelease) {
    assert.equal(
      health.release,
      expectedRelease,
      `部署版本不一致：期望 ${expectedRelease}，实际 ${health.release}`,
    )
  }

  const pageResponse = await fetchWithTimeout(fetchImpl, `${normalizedBaseUrl}/`, timeoutMs)
  assert.equal(pageResponse.status, 200, `首页返回 HTTP ${pageResponse.status}`)
  assert.match(
    pageResponse.headers.get('content-type') || '',
    /text\/html/i,
    '首页响应不是 HTML',
  )

  const html = await pageResponse.text()
  const assetMatch = html.match(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/i)
  assert.ok(assetMatch, '首页没有引用可验证的 JS 或 CSS 资源')

  const assetUrl = new URL(assetMatch[1], `${normalizedBaseUrl}/`).toString()
  const assetResponse = await fetchWithTimeout(fetchImpl, assetUrl, timeoutMs)
  assert.equal(assetResponse.status, 200, `静态资源返回 HTTP ${assetResponse.status}: ${assetUrl}`)

  return {
    release: health.release,
    assetUrl,
  }
}

if (require.main === module) {
  runSmokeTest({
    baseUrl: process.env.SMOKE_BASE_URL || DEFAULT_BASE_URL,
    expectedRelease: process.env.SMOKE_EXPECTED_RELEASE || '',
    timeoutMs: Number(process.env.SMOKE_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
  })
    .then(({ release, assetUrl }) => {
      console.log(`Smoke test passed: release=${release}, asset=${assetUrl}`)
    })
    .catch((error) => {
      console.error(`Smoke test failed: ${error.message}`)
      process.exitCode = 1
    })
}

module.exports = {
  runSmokeTest,
}
