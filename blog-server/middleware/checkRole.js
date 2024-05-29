const jwt = require("jsonwebtoken");
const key = require("../config/key");

const checkRole = (req, res, next) => {
  const token = req.get("Authorization");
  // console.log(token);

  if (!token) res.status(401).send("Unauthorized");

  jwt.verify(token, key, (err, decoded) => {
    console.log(err);
    if (err) {
      res.status(401).send("Unauthorized");
    } else {
      if (decoded.role !== "admin") res.status(401).send("Unauthorized");
      next();
    }
  });
}

module.exports = checkRole;