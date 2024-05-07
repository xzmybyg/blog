const jwt = require("jsonwebtoken");
const db = require("../utils/mysqlUtils");
const key = require("../utils/key");

const checkToken = (req, res, next) => {
  const token = req.get("Authorization");

  if (!token) res.status(401).send("Unauthorized");

  jwt.verify(token, key, (err, decoded) => {
    if (err) {
      res.status(401).send("Unauthorized");
    } else {
      if(decoded.role !== 'admin') res.status(401).send("Unauthorized");
      next();
    }
  });
};

module.exports = checkToken;