var express = require('express')
var router = express.Router()
const db = require('@utils/mysqlUtils')
const fs = require('fs')
const path = require('path')
const checkRole = require('@middleware/checkRole')

router.get('/', function (req, res, next) {
  const { id } = req.query
  const articleId = Number(id)

  if (Number.isInteger(articleId) && articleId > 0) {
    db.query('SELECT title, article FROM article WHERE id = ?', [articleId], (err, data, field) => {
      if (err) {
        console.error(err)
        res.status(500).send('Server error')
      } else if (data.length === 0) {
        res.status(404).send('Article not found')
      } else {
        const filePath = path.join(process.cwd(), 'public', 'article', `${data[0].article}.md`)
        if (req.query.download === '1') {
          res.download(filePath, `${data[0].title || data[0].article}.md`)
        } else {
          res.sendFile(filePath)
        }
      }
    })
  } else {
    res.status(400).send('Invalid article id')
  }
})

router.post('/', checkRole, function (req, res, _next) {
  const { fileName, content } = req.body

  const dir = 'public/article'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const filePath = path.join(__dirname, '../public/article/', `${fileName}.md`)

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error(err)
      res.status(500).send('Server error')
    } else {
      res.send('File uploaded!')
    }
  })
})

module.exports = router
