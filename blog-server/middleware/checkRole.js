const jwt = require('jsonwebtoken')
const key = require('../config/key')

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
    next()
  })
}

module.exports = checkRole
