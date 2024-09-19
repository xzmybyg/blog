var express = require('express')
var router = express.Router()
const db = require('@utils/mysqlUtils')
const articleDataProcessing = require('@utils/articleDataProcessing')
const checkRole = require('@middleware/checkRole')
const fs = require('fs')
const path = require('path')

//获取文章列表
router.get('/', function (req, res, _next) {
  const { page, pageSize, allList } = req.query

  let sql = allList
    ? `SELECT * FROM article 
    ORDER BY topping DESC`
    : `SELECT * FROM article 
    WHERE hidden = 0
    ORDER BY topping DESC 
    LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`

  db.query(sql, (err, data, _field) => {
    if (err) {
      console.error(err)
      res.status(500).send('Server error')
    } else {
      data = articleDataProcessing(data)
      res.send(data)
    }
  })
})

//新增文章
router.post('/', checkRole, function (req, res, _next) {
  // 从请求体中获取数据
  const {
    title, // 标题
    description, // 描述
    article, // 文章内容
    label, // 标签
    topping = 0, // 是否置顶，默认为0
    createTime = new Date(), // 创建日期，默认为当前日期
  } = req.body

  const sql = `INSERT INTO article 
  (title, description, article, label, topping, createTime) 
  VALUES (?, ?, ?, ?, ?, ?)`
  db.query(sql, [title, description, article, label, topping, createTime], (err, result) => {
    if (err) {
      console.error(err)
      res.status(500).send('Server error')
    } else {
      res.status(201).send('Article created')
    }
  })
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
router.put('/', checkRole, function (req, res, _next) {
  // 从请求体中获取文章 ID 和新的文章数据
  const { id, ...fields } = req.body
  fields.topping = fields.topping ? 1 : 0
  fields.hidden = fields.hidden ? 1 : 0
  if (Array.isArray(fields.label)) {
    fields.label = fields.label.join(',')
  }

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
  if (setParts.length === 0) {
    return res.status(400).send('No fields to update')
  }

  // 创建 SQL 查询
  const sql = `UPDATE article
  SET ${setParts.join(', ')}
  WHERE id = ?`

  // 添加文章 ID 到参数列表
  values.push(id)

  // 执行 SQL 查询
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err)
      res.status(500).send('Server error')
    } else if (result.affectedRows === 0) {
      res.status(404).send('Article not found')
    } else {
      res.status(200).send('Article updated')
    }
  })
})

//上传文章
router.post('/upload', checkRole, function (req, res, _next) {
  // 从请求体中获取文章 ID 和新的文章数据
  const { title, content } = req.body

  fs.writeFile(`./public/article/${title}.md`, content, (err) => {
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
