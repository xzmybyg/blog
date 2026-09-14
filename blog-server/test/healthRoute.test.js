const test = require('node:test')
const assert = require('node:assert/strict')
const express = require('express')

require('module-alias/register')

const dbModulePath = require.resolve('../utils/mysqlUtils')
const healthRoutePath = require.resolve('../routes/health')

async function requestHealth(query) {
  const previousReleaseSha = process.env.RELEASE_SHA
  process.env.RELEASE_SHA = 'test-commit'
  const previousDbModule = require.cache[dbModulePath]
  require.cache[dbModulePath] = {
    id: dbModulePath,
    filename: dbModulePath,
    loaded: true,
    exports: { promise: () => ({ query }) },
  }
  delete require.cache[healthRoutePath]

  const app = express()
  app.use('/api/health', require('../routes/health'))
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance))
  })

  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/health`)
    return { response, body: await response.json() }
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    delete require.cache[healthRoutePath]
    if (previousDbModule) require.cache[dbModulePath] = previousDbModule
    else delete require.cache[dbModulePath]
    if (previousReleaseSha === undefined) delete process.env.RELEASE_SHA
    else process.env.RELEASE_SHA = previousReleaseSha
  }
}

test('health endpoint reports an available database', async () => {
  const { response, body } = await requestHealth(async () => [[{ result: 1 }]])

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.equal(body.status, 'ok')
  assert.equal(body.database, 'ok')
  assert.equal(body.release, 'test-commit')
  assert.equal(typeof body.uptime, 'number')
  assert.ok(!Number.isNaN(Date.parse(body.timestamp)))
})

test('health endpoint returns 503 when the database is unavailable', async () => {
  const { response, body } = await requestHealth(async () => {
    throw new Error('database unavailable')
  })

  assert.equal(response.status, 503)
  assert.equal(body.status, 'error')
  assert.equal(body.database, 'unavailable')
  assert.equal(body.release, 'test-commit')
})
