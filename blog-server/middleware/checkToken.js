const jwt = require('jsonwebtoken')
const key = require('../config/key')

const checkToken = (req, res, next) => {
  const token = req.get('Authorization')

  if (!token) return res.status(401).send('Unauthorized')

  jwt.verify(token, key, (err, decoded) => {
    if (err) {
      return res.status(401).send('Unauthorized')
    } else {
      req.user = decoded
      next()
    }
  })
}

module.exports = checkToken
