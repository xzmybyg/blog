var express = require('express')
var router = express.Router()
const jwt = require('jsonwebtoken')
const md5 = require('md5')
const db = require('@utils/mysqlUtils')
const key = require('@config/key')
const checkRole = require('@middleware/checkRole')
const checkToken = require('@middleware/checkToken')
const { loginLimiter, registerLimiter, authenticatedWriteLimiter } = require('@middleware/rateLimit')

router.post('/login', loginLimiter, function (req, res) {
  const { username, password } = req.body || {}
  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
    return res.status(400).send('Username and password are required')
  }

  db.query(
    `SELECT 
    id,username,role,avatar,nickname,commentLimit,email
    FROM user
    WHERE username = ? AND password = ?`,
    [username.trim(), password],
    (err, data, _field) => {
      if (err) {
        console.error(err)
        res.status(500).send('Server error')
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
            },
          )
          res.set('Cache-Control', 'no-store')
          res.send({ token, ...data[0] })
        } else {
          res.status(401).send('Unauthorized')
        }
      }
    },
  )
})

router.post('/', registerLimiter, function (req, res, next) {
  const { username, password, email } = req.body?.params || req.body || {}
  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password || typeof email !== 'string' || !email) {
    return res.status(400).send({ message: '账号、密码和邮箱不能为空' })
  }

  const normalizedUsername = username.trim()
  db.query('SELECT id FROM user WHERE username = ? LIMIT 1', [normalizedUsername], (checkError, users) => {
    if (checkError) {
      console.error(checkError)
      return res.status(500).send({ message: '注册失败，请稍后重试' })
    }
    if (users.length > 0) {
      return res.status(409).send({ message: '该账号已存在，请直接登录' })
    }

    const sql = `INSERT INTO user
    (username, password,email)
    VALUES (?, ?, ?);`
    db.query(sql, [normalizedUsername, password, email], (err, result) => {
      if (err?.code === 'ER_DUP_ENTRY') {
        return res.status(409).send({ message: '该账号已存在，请直接登录' })
      }
      if (err) {
        console.error(err)
        return res.status(500).send({ message: '注册失败，请稍后重试' })
      }

      res.status(201).send({ id: result.insertId, message: '注册成功' })
    })
  })
})

router.delete('/', checkRole, function (req, res, next) {
  //TODO: 删除用户
})

router.put('/', checkToken, authenticatedWriteLimiter, function (req, res, next) {
  const { id: requestedId, ...fields } = req.body
  const { id: currentUserId, role } = req.user
  if (role === 'viewer') return res.status(403).send('Forbidden')
  const isAdmin = role === 'admin'
  const targetUserId = isAdmin && requestedId !== undefined ? Number(requestedId) : Number(currentUserId)
  const allowedFields = isAdmin
    ? ['nickname', 'avatar', 'password', 'role', 'email', 'commentLimit']
    : ['nickname', 'avatar', 'password']

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    return res.status(400).send('Invalid user id')
  }

  const setParts = []
  const values = []
  for (const [key, value] of Object.entries(fields)) {
    if (!allowedFields.includes(key)) continue
    if (key === 'role' && !['admin', 'viewer', 'user'].includes(value)) {
      return res.status(400).send('Invalid user role')
    }
    setParts.push(`${key} = ?`)
    values.push(key === 'commentLimit' ? (value ? 1 : 0) : value)
  }

  // 如果没有接收到任何字段，返回错误
  if (setParts.length === 0) {
    return res.status(400).send('No fields to update')
  }

  // 创建 SQL 查询
  const sql = `UPDATE user
  SET ${setParts.join(', ')}
  WHERE id = ?`

  // 执行 SQL 查询
  db.query(sql, [...values, targetUserId], (err, result) => {
    if (err) {
      console.error(err)
      res.status(500).send('Server error')
    } else if (result.affectedRows === 0) {
      res.status(404).send('User not found')
    } else {
      res.status(200).send('User updated')
    }
  })
})

router.get('/usersList', checkRole, function (req, res, next) {
  db.query(
    `SELECT 
    id,username,role,avatar,nickname,commentLimit,email,createTime
    FROM user`,
    (err, data, _field) => {
      if (err) {
        console.error(err)
        res.status(500).send('Server error')
      } else {
        res.send(data)
      }
    },
  )
})

module.exports = router
