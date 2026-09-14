var express = require('express')
var router = express.Router()
const db = require('@utils/mysqlUtils')
const checkRole = require('@middleware/checkRole')
const checkToken = require('@middleware/checkToken')
const { interactionLimiter } = require('@middleware/rateLimit')

router.post('/', checkToken, interactionLimiter, function (req, res, _next) {
  const { reply_comment_id, reply_user_id, content, createTime = new Date() } = req.body?.params || {}
  const normalizedCommentId = Number(reply_comment_id)
  const normalizedUserId = Number(reply_user_id)
  const normalizedContent = typeof content === 'string' ? content.trim() : ''
  if (
    !Number.isInteger(normalizedCommentId) || normalizedCommentId <= 0 ||
    !Number.isInteger(normalizedUserId) || normalizedUserId <= 0 ||
    !normalizedContent || normalizedContent.length > 1000
  ) {
    return res.status(400).send({ message: '回复信息无效' })
  }
  const user_id = req.user.id

  const sql = `INSERT INTO reply 
  (user_id, reply_comment_id, reply_user_id, content, createTime)
   VALUES (?, ?, ?, ?, ?);`

  db.query(sql, [user_id, normalizedCommentId, normalizedUserId, normalizedContent, createTime], (err, result) => {
    if (err) {
      console.error(err)
      res.status(500).send('Server error')
    } else {
      res.status(201).send('Reply created')
    }
  })
})

router.delete('/', checkRole, function (req, res, _next) {
  const id = Number(req.query.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).send({ message: '回复 ID 无效' })

  const sql = `DELETE FROM reply WHERE id = ?`

  db.query(sql, [id], (err, _result) => {
    if (err) {
      console.error(err)
      res.status(500).send('Server error')
    } else {
      res.status(204).send('Reply deleted')
    }
  })
})

module.exports = router
