const express = require('express')
const db = require('@utils/mysqlUtils')
const checkRole = require('@middleware/checkRole')

const router = express.Router()

router.get('/', function (_req, res) {
  db.query(
    `SELECT t.id, t.name, t.description, t.createTime, COUNT(a.id) AS articleCount
     FROM article_topic t
     LEFT JOIN article a ON a.topic_id = t.id
     GROUP BY t.id
     ORDER BY t.createTime DESC, t.id DESC`,
    (error, rows) => {
      if (error) {
        console.error(error)
        return res.status(500).send('Server error')
      }
      res.send(rows)
    },
  )
})

router.post('/', checkRole, function (req, res) {
  const name = String(req.body.name || '').trim()
  const description = String(req.body.description || '').trim()
  if (!name) return res.status(400).send({ message: '请输入专题名称' })

  db.query(
    'INSERT INTO article_topic (name, description) VALUES (?, ?)',
    [name, description],
    (error, result) => {
      if (error?.code === 'ER_DUP_ENTRY') return res.status(409).send({ message: '专题名称已存在' })
      if (error) {
        console.error(error)
        return res.status(500).send('Server error')
      }
      db.query('SELECT *, 0 AS articleCount FROM article_topic WHERE id = ?', [result.insertId], (selectError, rows) => {
        if (selectError) {
          console.error(selectError)
          return res.status(500).send('Server error')
        }
        res.status(201).send(rows[0])
      })
    },
  )
})

router.put('/', checkRole, function (req, res) {
  const id = Number(req.body.id)
  const name = String(req.body.name || '').trim()
  const description = String(req.body.description || '').trim()
  if (!Number.isInteger(id) || id <= 0 || !name) {
    return res.status(400).send({ message: '专题信息不完整' })
  }

  db.query('UPDATE article_topic SET name = ?, description = ? WHERE id = ?', [name, description, id], (error, result) => {
    if (error?.code === 'ER_DUP_ENTRY') return res.status(409).send({ message: '专题名称已存在' })
    if (error) {
      console.error(error)
      return res.status(500).send('Server error')
    }
    if (result.affectedRows === 0) return res.status(404).send({ message: '专题不存在' })
    res.send('Topic updated')
  })
})

router.delete('/', checkRole, function (req, res) {
  const id = Number(req.query.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).send({ message: '专题 ID 无效' })

  db.query('SELECT COUNT(*) AS count FROM article WHERE topic_id = ?', [id], (countError, rows) => {
    if (countError) {
      console.error(countError)
      return res.status(500).send('Server error')
    }
    if (Number(rows[0].count) > 0) {
      return res.status(409).send({ message: '该专题仍有关联文章，无法删除' })
    }
    db.query('DELETE FROM article_topic WHERE id = ?', [id], (error, result) => {
      if (error) {
        console.error(error)
        return res.status(500).send('Server error')
      }
      if (result.affectedRows === 0) return res.status(404).send({ message: '专题不存在' })
      res.send('Topic deleted')
    })
  })
})

module.exports = router
