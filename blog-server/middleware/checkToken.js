const jwt = require("jsonwebtoken")
const key = require("../utils/key")

const checkToken = (req, res, next) => {
  const token = req.get("Authorization")

  if (!token) res.status(401).send("Unauthorized")

  jwt.verify(token, key, (err, decoded) => {
    if (err) {
      res.status(401).send("Unauthorized")
    } else {
      req.user = decoded
      next()
    }
  })
}

module.exports = checkToken
