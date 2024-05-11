var express = require("express")
var router = express.Router()
const jwt = require("jsonwebtoken")
const md5 = require("md5")
const db = require("../utils/mysqlUtils")
const key = require("../utils/key")
const checkRole = require("../middleware/checkRole")
const checkToken = require("../middleware/checkToken")

/* GET users listing. */
router.get("/", function (req, res, next) {
  const { username, password } = req.query
  db.query(
    `SELECT 
    id,username,role,avatar,nickname,commentLimit,email
    FROM user
    WHERE username='${username}' AND password='${password}'`,
    (err, data, _field) => {
      if (err) {
        console.error(err)
        res.status(500).send("Server error")
      } else {
        if (data.length > 0) {
          const { id, username, role } = data[0]
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
          )
          res.send({ token, ...data[0] })
        } else {
          res.status(401).send("Unauthorized")
        }
      }
    }
  )
})

router.post("/", function (req, res, next) {
  const { username, password, email } = req.body.params

  const sql = `INSERT INTO user
  (username, password,email)
  VALUES (?, ?, ?);`
  db.query(sql, [username, password, email], (err, result) => {
    if (err) {
      console.error(err)
      res.status(500).send("Server error")
    } else {
      res.status(201).send("User created")
    }
  })

  // send("注册成功");
})

router.delete("/", checkRole, function (req, res, next) {
  //TODO: 删除用户
})

router.put("/", checkToken, function (req, res, next) {
  //TODO: 更新用户信息
  const { id, ...fields } = req.body

  // 创建 SQL 查询的 SET 部分
  const setParts = []
  const values = []
  for (const [key, value] of Object.entries(fields)) {
    if (key === "createTime") {
      setParts.push(`${key} =FROM_UNIXTIME(?)`)
      const date = new Date(value)
      values.push(Math.floor(date.getTime() / 1000))
    } else {
      setParts.push(`${key} = ?`)
      values.push(value)
    }
  }

  // 如果没有接收到任何字段，返回错误
  if (setParts.length === 0) {
    return res.status(400).send("No fields to update")
  }

  // 创建 SQL 查询
  const sql = `UPDATE user
  SET ${setParts.join(", ")}
  WHERE id = ?`

  // 执行 SQL 查询
  db.query(sql, [...values, id], (err, result) => {
    if (err) {
      console.error(err)
      res.status(500).send("Server error")
    } else if (result.affectedRows === 0) {
      res.status(404).send("User not found")
    } else {
      res.status(200).send("User updated")
    }
  })
})

router.get("/usersList", function (req, res, next) {
  db.query(
    `SELECT 
    id,username,role,avatar,nickname,commentLimit,email,createTime
    FROM user`,
    (err, data, _field) => {
      if (err) {
        console.error(err)
        res.status(500).send("Server error")
      } else {
        res.send(data)
      }
    }
  )
})

module.exports = router
