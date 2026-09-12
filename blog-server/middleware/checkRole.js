const jwt = require('jsonwebtoken')
const key = require('../config/key')
const { authenticatedWriteLimiter } = require('./rateLimit')

const checkRole = (req, res, next) => {
  const token = req.get('Authorization')
  if (!token) return res.status(401).send('Unauthorized')

  jwt.verify(token, key, (err, decoded) => {
    if (err) {
      return res.status(401).send('Unauthorized')
    }

    const isAdmin = decoded.role === 'admin'
    const isReadOnlyRequest = decoded.role === 'viewer' && ['GET', 'HEAD', 'OPTIONS'].includes(req.method)
    if (!isAdmin && !isReadOnlyRequest) return res.status(403).send('Forbidden')

    req.user = decoded
    if (isAdmin && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return authenticatedWriteLimiter(req, res, next)
    }
    next()
  })
}

module.exports = checkRole
