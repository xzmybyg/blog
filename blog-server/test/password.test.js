const assert = require('node:assert/strict')
const test = require('node:test')
const { hashPassword, verifyPassword } = require('../utils/password')

test('password hashes do not expose the original password', async () => {
  const hash = await hashPassword('new-password-123')

  assert.match(hash, /^scrypt\$[a-f0-9]+\$[a-f0-9]+$/)
  assert.doesNotMatch(hash, /new-password-123/)
  assert.equal(await verifyPassword('new-password-123', hash), true)
  assert.equal(await verifyPassword('wrong-password', hash), false)
})

test('legacy plain text passwords remain compatible during migration', async () => {
  assert.equal(await verifyPassword('legacy-password', 'legacy-password'), true)
  assert.equal(await verifyPassword('wrong-password', 'legacy-password'), false)
})
