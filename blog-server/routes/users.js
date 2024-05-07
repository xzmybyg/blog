var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const db = require("../utils/mysqlUtils");
const key = require("../utils/key");

/* GET users listing. */
router.get("/", function (req, res, next) {
  const { username, password } = req.query;
  db.query(
    `SELECT 
    id,userName,role,avatar,nickname,commentLimit,email
    FROM user
    WHERE username='${username}' AND password='${password}'`,
    (err, data, _field) => {
      if (err) {
        console.error(err);
        res.status(500).send("Server error");
      } else {
        if (data.length > 0) {
          const { id, username, role } = data[0];
          let token = jwt.sign(
            {
              id,
              username,
              role,
            },
            key,
            {
              expiresIn: 60 * 60 * 24 * 7,
            }
          );
          res.send({ token, ...data[0] });
        } else {
          res.status(401).send("Unauthorized");
        }
      }
    }
  );
});

router.post("/", function (req, res, next) {
  const { username, password, email } = req.body.params;

  const sql = `INSERT INTO user
  (userName, password,email)
  VALUES (?, ?, ?);`;
  db.query(sql, [username, password, email], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
    } else {
      res.status(201).send("User created");
    }
  });

  // send("注册成功");
});

router.delete("/", function (req, res, next) {
  //TODO: 删除用户
});

router.put("/", function (req, res, next) {
  //TODO: 更新用户信息
});

router.get("/usersList", function (req, res, next) {
  db.query(
    `SELECT 
    id,userName,role,avatar,nickname,commentLimit,email,createTime
    FROM user`,
    (err, data, _field) => {
      if (err) {
        console.error(err);
        res.status(500).send("Server error");
      } else {
        res.send(data);
      }
    }
  );
});

module.exports = router;
