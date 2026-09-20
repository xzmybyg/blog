var express = require('express')
var router = express.Router()
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const db = require('@utils/mysqlUtils')
const key = require('@config/key')
const checkRole = require('@middleware/checkRole')
const checkToken = require('@middleware/checkToken')
const { hashPassword, verifyPassword } = require('../utils/password')
const { sendPasswordResetCode } = require('../utils/mailer')
const {
  loginLimiter,
  registerLimiter,
  passwordResetRequestLimiter,
  passwordResetConfirmLimiter,
  authenticatedWriteLimiter,
} = require('@middleware/rateLimit')

const PASSWORD_RESET_MESSAGE = '如果该邮箱已注册，验证码将发送至邮箱，请注意查收'

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function hashResetCode(userId, code) {
  const pepper = process.env.PASSWORD_RESET_PEPPER || key
  return crypto.createHash('sha256').update(`${userId}:${code}:${pepper}`).digest('hex')
}

router.post('/login', loginLimiter, function (req, res) {
  const { username, password } = req.body || {}
  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
    return res.status(400).send('Username and password are required')
  }

  db.query(
    `SELECT 
    id,username,password,role,avatar,nickname,commentLimit,email
    FROM user
    WHERE username = ? LIMIT 1`,
    [username.trim()],
    (err, data, _field) => {
      if (err) {
        console.error(err)
        res.status(500).send('Server error')
      } else if (data.length > 0) {
        const user = data[0]
        verifyPassword(password, user.password)
          .then(async (matches) => {
            if (!matches) return res.status(401).send('Unauthorized')
            const { id, username, role, password: storedPassword, ...profile } = user
            if (!storedPassword.startsWith('scrypt$')) {
              const upgradedPassword = await hashPassword(password)
              db.query('UPDATE user SET password = ? WHERE id = ?', [upgradedPassword, id], () => {})
            }
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
            res.send({ token, id, username, role, ...profile })
          })
          .catch((error) => {
            console.error(error)
            res.status(500).send('Server error')
          })
      } else {
        res.status(401).send('Unauthorized')
      }
    },
  )
})

router.post('/', registerLimiter, function (req, res) {
  const { username, password, email } = req.body?.params || req.body || {}
  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password || typeof email !== 'string' || !email) {
    return res.status(400).send({ message: '账号、密码和邮箱不能为空' })
  }

  const normalizedUsername = username.trim()
  const normalizedEmail = normalizeEmail(email)
  if (!isValidEmail(normalizedEmail) || password.length < 8 || password.length > 72) {
    return res.status(400).send({ message: '邮箱格式无效或密码长度不符合要求' })
  }
  db.query('SELECT id FROM user WHERE username = ? LIMIT 1', [normalizedUsername], (checkError, users) => {
    if (checkError) {
      console.error(checkError)
      return res.status(500).send({ message: '注册失败，请稍后重试' })
    }
    if (users.length > 0) {
      return res.status(409).send({ message: '该账号已存在，请直接登录' })
    }

    hashPassword(password).then((passwordHash) => {
      const sql = `INSERT INTO user
      (username, password,email)
      VALUES (?, ?, ?);`
      db.query(sql, [normalizedUsername, passwordHash, normalizedEmail], (err, result) => {
      if (err?.code === 'ER_DUP_ENTRY') {
        return res.status(409).send({ message: '该账号已存在，请直接登录' })
      }
      if (err) {
        console.error(err)
        return res.status(500).send({ message: '注册失败，请稍后重试' })
      }

      res.status(201).send({ id: result.insertId, message: '注册成功' })
      })
    }).catch((error) => {
      console.error(error)
      res.status(500).send({ message: '注册失败，请稍后重试' })
    })
  })
})

router.post('/password-reset/request', passwordResetRequestLimiter, async function (req, res) {
  const email = normalizeEmail(req.body?.email)
  if (!isValidEmail(email)) return res.status(400).send({ message: '请输入有效的邮箱地址' })

  try {
    const [users] = await db.promise().query('SELECT id FROM user WHERE LOWER(email) = ? LIMIT 1', [email])
    if (users.length > 0) {
      const userId = users[0].id
      const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0')
      const codeHash = hashResetCode(userId, code)
      await db.promise().query('DELETE FROM password_reset_token WHERE user_id = ?', [userId])
      const [result] = await db.promise().query(
        `INSERT INTO password_reset_token (user_id, code_hash, expires_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
        [userId, codeHash],
      )
      try {
        await sendPasswordResetCode(email, code)
      } catch (mailError) {
        await db.promise().query('DELETE FROM password_reset_token WHERE id = ?', [result.insertId])
        console.error(`密码重置邮件发送失败：${mailError.message}`)
      }
    }
  } catch (error) {
    console.error(`密码重置请求处理失败：${error.message}`)
  }

  res.status(202).send({ message: PASSWORD_RESET_MESSAGE })
})

router.post('/password-reset/confirm', passwordResetConfirmLimiter, async function (req, res) {
  const email = normalizeEmail(req.body?.email)
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : ''
  const password = req.body?.password
  if (!isValidEmail(email) || !/^\d{6}$/.test(code) || typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return res.status(400).send({ message: '邮箱、验证码或新密码格式无效' })
  }

  let connection
  try {
    connection = await db.promise().getConnection()
    await connection.beginTransaction()
    const [tokens] = await connection.query(
      `SELECT token.id, token.user_id, token.code_hash, token.attempts
       FROM password_reset_token token
       INNER JOIN user ON user.id = token.user_id
       WHERE LOWER(user.email) = ? AND token.consumed_at IS NULL AND token.expires_at > NOW()
       ORDER BY token.created_at DESC LIMIT 1 FOR UPDATE`,
      [email],
    )
    const token = tokens[0]
    const submittedHash = token ? hashResetCode(token.user_id, code) : ''
    const matches = token && token.attempts < 5 && crypto.timingSafeEqual(Buffer.from(token.code_hash), Buffer.from(submittedHash))
    if (!matches) {
      if (token) await connection.query('UPDATE password_reset_token SET attempts = attempts + 1 WHERE id = ?', [token.id])
      await connection.commit()
      return res.status(400).send({ message: '验证码无效或已过期' })
    }

    const passwordHash = await hashPassword(password)
    await connection.query('UPDATE user SET password = ? WHERE id = ?', [passwordHash, token.user_id])
    await connection.query('UPDATE password_reset_token SET consumed_at = NOW() WHERE id = ?', [token.id])
    await connection.commit()
    res.send({ message: '密码已重置，请使用新密码登录' })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error(error)
    res.status(500).send({ message: '密码重置失败，请稍后重试' })
  } finally {
    connection?.release()
  }
})

router.delete('/', checkRole, function (req, res, next) {
  //TODO: 删除用户
})

router.put('/', checkToken, authenticatedWriteLimiter, async function (req, res) {
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
    if (key === 'password' && (typeof value !== 'string' || value.length < 8 || value.length > 72)) {
      return res.status(400).send('Invalid password')
    }
    setParts.push(`${key} = ?`)
    values.push(
      key === 'commentLimit'
        ? (value ? 1 : 0)
        : key === 'password'
          ? await hashPassword(value)
          : value,
    )
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
