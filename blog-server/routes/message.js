var express = require('express')
var router = express.Router()
const db = require('@utils/mysqlUtils')
const checkRole = require('@middleware/checkRole')
const checkToken = require('@middleware/checkToken')
const { interactionLimiter } = require('@middleware/rateLimit')

router.get('/', function (req, res, _next) {
  const sql = `SELECT * FROM message`
  db.query(sql, (err, data, _field) => {
    if (err) {
      console.error(err)
    } else {
      res.send(data)
    }
  })
})

router.get('/admin', checkRole, function (_req, res) {
  const sql = `SELECT message.*, user.username, user.nickname
    FROM message
    LEFT JOIN user ON user.id = message.user_id
    ORDER BY message.createTime DESC`

  db.query(sql, (err, data) => {
    if (err) {
      console.error(err)
      res.status(500).send('Server error')
    } else {
      res.send(data)
    }
  })
})

router.post('/', checkToken, interactionLimiter, function (req, res, _next) {
  const { content, createTime = new Date() } = req.body
  const user_id = req.user.id
  const sql = `INSERT INTO message (user_id, content, createTime) VALUES (?, ?, ?)`
  db.query(sql, [user_id, content, createTime], (err, result) => {
    if (err) {
      console.error(err)
      res.status(500).send('Server error')
    } else {
      const data = {
        id: result.insertId,
        user_id,
        content,
        createTime,
      }
      res.status(200).send(data)
    }
  })
})

router.delete('/', checkRole, function (req, res, _next) {
  const { id } = req.query
  const sql = `DELETE FROM message WHERE id = ?`
  db.query(sql, [id], (err, _result) => {
    if (err) {
      console.error(err)
      res.status(500).send('Server error')
    } else {
      res.status(200).send('Message deleted')
    }
  })
})

module.exports = router
