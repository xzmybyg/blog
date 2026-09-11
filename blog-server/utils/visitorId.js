const crypto = require('crypto')

function hashVisitorId(value) {
  if (typeof value !== 'string') return ''

  const visitorId = value.trim()
  if (!visitorId || visitorId.length > 128) return ''

  return crypto.createHash('sha256').update(visitorId).digest('hex')
}

module.exports = hashVisitorId
