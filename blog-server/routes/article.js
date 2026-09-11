var express = require('express')
var router = express.Router()
const db = require('@utils/mysqlUtils')
const articleDataProcessing = require('@utils/articleDataProcessing')
const checkRole = require('@middleware/checkRole')
const fs = require('fs')
const path = require('path')
const hashVisitorId = require('@utils/visitorId')

const articleSelect = `SELECT a.*,
  GROUP_CONCAT(DISTINCT l.label ORDER BY l.id SEPARATOR ',') AS label,
  GROUP_CONCAT(DISTINCT l.id ORDER BY l.id SEPARATOR ',') AS labelIds,
  t.name AS topicName
  FROM article a
  LEFT JOIN label l ON FIND_IN_SET(l.id, a.label) > 0
  LEFT JOIN article_topic t ON t.id = a.topic_id`

function normalizeLabelIds(labelIds) {
  if (!Array.isArray(labelIds)) return []
  return [...new Set(labelIds.map(Number).filter(Number.isInteger).filter((id) => id > 0))]
}

function serializeLabelIds(labelIds) {
  const value = labelIds.join(',')
  if (value.length > 15) {
    const error = new Error('标签数量超出文章字段限制')
    error.statusCode = 400
    throw error
  }
  return value
}

async function validateLabelIds(connection, labelIds) {
  if (labelIds.length === 0) return
  const [rows] = await connection.query('SELECT id FROM label WHERE id IN (?)', [labelIds])
  if (rows.length !== labelIds.length) {
    const error = new Error('One or more labels do not exist')
    error.statusCode = 400
    throw error
  }
}

async function validateTopicId(connection, topicId) {
  if (topicId === null) return
  const [rows] = await connection.query('SELECT id FROM article_topic WHERE id = ?', [topicId])
  if (rows.length === 0) {
    const error = new Error('Topic does not exist')
    error.statusCode = 400
    throw error
  }
}

function normalizeTopicOrder(topicOrder) {
  const value = Number(topicOrder ?? 0)
  if (!Number.isInteger(value) || value < 0) {
    const error = new Error('Invalid topic order')
    error.statusCode = 400
    throw error
  }
  return value
}

//获取文章列表
router.get('/', function (req, res, _next) {
  const { page, pageSize, allList } = req.query

  if (allList) {
    const sql = `${articleSelect}
    WHERE a.hidden = 0
    GROUP BY a.id
    ORDER BY a.topping DESC`

    return db.query(sql, (err, data, _field) => {
      if (err) {
        console.error(err)
        res.status(500).send('Server error')
      } else {
        res.send(articleDataProcessing(data))
      }
    })
  }

  const currentPage = Math.max(Number.parseInt(page, 10) || 1, 1)
  const currentPageSize = Math.max(Number.parseInt(pageSize, 10) || 5, 1)
  const articleSql = `${articleSelect}
    WHERE a.hidden = 0
    GROUP BY a.id
    ORDER BY a.topping DESC
    LIMIT ? OFFSET ?`
  const countSql = `SELECT COUNT(*) AS total FROM article WHERE hidden = 0`

  db.query(countSql, (countErr, countData) => {
    if (countErr) {
      console.error(countErr)
      return res.status(500).send('Server error')
    }

    db.query(
      articleSql,
      [currentPageSize, (currentPage - 1) * currentPageSize],
      (err, data, _field) => {
        if (err) {
          console.error(err)
          res.status(500).send('Server error')
        } else {
          res.send({
            list: articleDataProcessing(data),
            total: Number(countData[0].total),
          })
        }
      },
    )
  })
})

// 管理系统获取全部文章，包括隐藏文章
router.get('/admin', checkRole, function (_req, res) {
  const sql = `${articleSelect}
    GROUP BY a.id
    ORDER BY a.topping DESC, a.createTime DESC`

  db.query(sql, (err, data) => {
    if (err) {
      console.error(err)
      res.status(500).send('Server error')
    } else {
      res.send(articleDataProcessing(data))
    }
  })
})

// 获取同一专题内的上一篇和下一篇文章
router.get('/navigation', function (req, res) {
  const articleId = Number(req.query.id)
  if (!Number.isInteger(articleId) || articleId <= 0) {
    return res.status(400).send({ message: '文章 ID 无效' })
  }

  db.query(
    `SELECT a.id, a.topic_id AS topicId, t.name AS topicName
     FROM article a
     LEFT JOIN article_topic t ON t.id = a.topic_id
     WHERE a.id = ? AND a.hidden = 0`,
    [articleId],
    (currentError, currentRows) => {
      if (currentError) {
        console.error(currentError)
        return res.status(500).send('Server error')
      }
      if (currentRows.length === 0) return res.status(404).send({ message: '文章不存在' })
      const current = currentRows[0]
      if (current.topicId === null) {
        return res.send({ topic: null, position: null, total: 0, previous: null, next: null })
      }

      db.query(
        `SELECT id, title
         FROM article
         WHERE topic_id = ? AND hidden = 0
         ORDER BY topic_order ASC, createTime ASC, id ASC`,
        [current.topicId],
        (listError, rows) => {
          if (listError) {
            console.error(listError)
            return res.status(500).send('Server error')
          }
          const index = rows.findIndex((item) => item.id === articleId)
          res.send({
            topic: { id: current.topicId, name: current.topicName },
            position: index + 1,
            total: rows.length,
            previous: index > 0 ? rows[index - 1] : null,
            next: index >= 0 && index < rows.length - 1 ? rows[index + 1] : null,
          })
        },
      )
    },
  )
})

router.get('/likes', function (req, res) {
  const articleId = Number(req.query.id)
  if (!Number.isInteger(articleId) || articleId <= 0) {
    return res.status(400).send({ message: '文章 ID 无效' })
  }

  db.query(
    `SELECT a.id, COUNT(al.article_id) AS likes
     FROM article a
     LEFT JOIN article_like al ON al.article_id = a.id
     WHERE a.id = ? AND a.hidden = 0
     GROUP BY a.id`,
    [articleId],
    (error, rows) => {
      if (error) {
        console.error(error)
        return res.status(500).send('Server error')
      }
      if (rows.length === 0) return res.status(404).send({ message: '文章不存在' })

      res.send({ likes: Number(rows[0].likes) })
    },
  )
})

router.post('/like', function (req, res) {
  const articleId = Number(req.body?.articleId)
  const visitorHash = hashVisitorId(req.body?.visitorId)
  if (!Number.isInteger(articleId) || articleId <= 0 || !visitorHash) {
    return res.status(400).send({ message: '点赞信息无效' })
  }

  db.query(
    `INSERT IGNORE INTO article_like (article_id, visitor_hash)
     SELECT id, ? FROM article WHERE id = ? AND hidden = 0`,
    [visitorHash, articleId],
    (insertError) => {
      if (insertError) {
        console.error(insertError)
        return res.status(500).send('Server error')
      }

      db.query(
        `SELECT a.id, COUNT(al.article_id) AS likes
         FROM article a
         LEFT JOIN article_like al ON al.article_id = a.id
         WHERE a.id = ? AND a.hidden = 0
         GROUP BY a.id`,
        [articleId],
        (countError, rows) => {
          if (countError) {
            console.error(countError)
            return res.status(500).send('Server error')
          }
          if (rows.length === 0) return res.status(404).send({ message: '文章不存在' })

          res.send({ likes: Number(rows[0].likes), liked: true })
        },
      )
    },
  )
})

//新增文章
router.post('/', checkRole, async function (req, res, _next) {
  // 从请求体中获取数据
  const {
    title, // 标题
    description = '', // 描述
    article, // 文章内容
    labelIds = [], // 标签 ID
    topicId = null, // 专题 ID
    topicOrder = 0, // 专题内章节顺序
    banner = '', // 封面
    topping = 0, // 是否置顶，默认为0
    createTime = new Date(), // 创建日期，默认为当前日期
    hidden = 0, // 是否隐藏，默认为0
  } = req.body

  if (!title || !article) {
    return res.status(400).send('Incorrect fields')
  }

  const normalizedLabelIds = normalizeLabelIds(labelIds)
  const normalizedTopicId = topicId === null || topicId === undefined ? null : Number(topicId)
  if (normalizedTopicId !== null && (!Number.isInteger(normalizedTopicId) || normalizedTopicId <= 0)) {
    return res.status(400).send('Invalid topic id')
  }
  let normalizedTopicOrder
  try {
    normalizedTopicOrder = normalizeTopicOrder(topicOrder)
  } catch (error) {
    return res.status(error.statusCode).send(error.message)
  }
  const connection = await db.promise().getConnection()
  try {
    await connection.beginTransaction()
    await validateLabelIds(connection, normalizedLabelIds)
    await validateTopicId(connection, normalizedTopicId)
    await connection.query(
      `INSERT INTO article
      (title, description, article, label, topic_id, topic_order, banner, topping, createTime, hidden)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, article, serializeLabelIds(normalizedLabelIds), normalizedTopicId, normalizedTopicOrder, banner, topping ? 1 : 0, createTime, hidden ? 1 : 0],
    )
    await connection.commit()
    res.status(201).send('Article created')
  } catch (error) {
    await connection.rollback()
    console.error(error)
    res.status(error.statusCode || 500).send(error.statusCode ? error.message : 'Server error')
  } finally {
    connection.release()
  }
})

//删除文章
router.delete('/', checkRole, function (req, res, _next) {
  // 从查询参数中获取文章 ID
  const { id } = req.query
  // 创建 SQL 查询
  const sql = `
  DELETE FROM article 
  WHERE id = ?`

  // 执行 SQL 查询
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err)
      res.status(500).send('Server error')
    } else if (result.affectedRows === 0) {
      res.status(404).send('Article not found')
    } else {
      res.status(200).send('Article deleted')
    }
  })
})

//修改文章
router.put('/', checkRole, async function (req, res, _next) {
  // 从请求体中获取文章 ID 和新的文章数据
  const { id, labelIds, topicId, topicOrder, ...requestedFields } = req.body
  const allowedFields = ['title', 'description', 'article', 'banner', 'topping', 'createTime', 'hidden']
  const fields = Object.fromEntries(Object.entries(requestedFields).filter(([key]) => allowedFields.includes(key)))
  if ('topping' in fields) fields.topping = fields.topping ? 1 : 0
  if ('hidden' in fields) fields.hidden = fields.hidden ? 1 : 0

  // 创建 SQL 查询的 SET 部分
  const setParts = []
  const values = []
  for (const [key, value] of Object.entries(fields)) {
    if (key === 'createTime') {
      setParts.push(`${key} =FROM_UNIXTIME(?)`)
      const date = new Date(value)
      values.push(Math.floor(date.getTime() / 1000))
    } else {
      setParts.push(`${key} = ?`)
      values.push(value)
    }
  }

  // 如果没有接收到任何字段，返回错误
  if (setParts.length === 0 && labelIds === undefined && topicId === undefined && topicOrder === undefined) {
    return res.status(400).send('No fields to update')
  }

  const connection = await db.promise().getConnection()
  try {
    await connection.beginTransaction()
    const [articles] = await connection.query('SELECT id FROM article WHERE id = ? FOR UPDATE', [id])
    if (articles.length === 0) {
      await connection.rollback()
      return res.status(404).send('Article not found')
    }
    if (setParts.length > 0) {
      await connection.query(`UPDATE article SET ${setParts.join(', ')} WHERE id = ?`, [...values, id])
    }
    if (labelIds !== undefined) {
      const normalizedLabelIds = normalizeLabelIds(labelIds)
      await validateLabelIds(connection, normalizedLabelIds)
      await connection.query('UPDATE article SET label = ? WHERE id = ?', [serializeLabelIds(normalizedLabelIds), id])
    }
    if (topicId !== undefined) {
      const normalizedTopicId = topicId === null ? null : Number(topicId)
      if (normalizedTopicId !== null && (!Number.isInteger(normalizedTopicId) || normalizedTopicId <= 0)) {
        const error = new Error('Invalid topic id')
        error.statusCode = 400
        throw error
      }
      await validateTopicId(connection, normalizedTopicId)
      await connection.query('UPDATE article SET topic_id = ? WHERE id = ?', [normalizedTopicId, id])
    }
    if (topicOrder !== undefined) {
      await connection.query('UPDATE article SET topic_order = ? WHERE id = ?', [normalizeTopicOrder(topicOrder), id])
    }
    await connection.commit()
    res.status(200).send('Article updated')
  } catch (error) {
    await connection.rollback()
    console.error(error)
    res.status(error.statusCode || 500).send(error.statusCode ? error.message : 'Server error')
  } finally {
    connection.release()
  }
})

//上传文章
router.post('/upload', checkRole, function (req, res, _next) {
  // 从请求体中获取文章 ID 和新的文章数据
  const { title, content } = req.body
  const fileName = String(title || '')
    .trim()
    .replace(/\.md$/i, '')

  if (!fileName || /[\\/:*?"<>|]/.test(fileName) || typeof content !== 'string') {
    return res.status(400).send('Invalid article file')
  }

  fs.writeFile(path.join(process.cwd(), 'public', 'article', `${fileName}.md`), content, (err) => {
    if (err) {
      console.error(err)
      res.status(500).send('Server error')
    } else {
      res.status(200).send('Article updated')
    }
  })
})

//获取已有文章列表
router.get('/articles', function (req, res, _next) {
  const articlePath = path.join(process.cwd(), './public/article')

  fs.readdir(articlePath, (err, files) => {
    if (err) {
      console.error(err)
      res.status(500).send('Server error')
    } else {
      const fileNamesWithoutExt = files.map((file) => path.parse(file).name)
      res.status(200).send(fileNamesWithoutExt)
    }
  })
})

module.exports = router
