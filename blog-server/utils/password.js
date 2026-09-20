const crypto = require('crypto')

const KEY_LENGTH = 64

function scrypt(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) reject(error)
      else resolve(derivedKey)
    })
  })
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = await scrypt(password, salt)
  return `scrypt$${salt}$${derivedKey.toString('hex')}`
}

async function verifyPassword(password, storedPassword) {
  if (typeof password !== 'string' || typeof storedPassword !== 'string') return false
  if (!storedPassword.startsWith('scrypt$')) {
    const submitted = Buffer.from(password)
    const stored = Buffer.from(storedPassword)
    return submitted.length === stored.length && crypto.timingSafeEqual(submitted, stored)
  }

  const [, salt, expectedHex] = storedPassword.split('$')
  if (!salt || !expectedHex) return false
  const expected = Buffer.from(expectedHex, 'hex')
  const actual = await scrypt(password, salt)
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

module.exports = { hashPassword, verifyPassword }
