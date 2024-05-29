var express = require('express')
var router = express.Router()
const db = require('../utils/mysqlUtils')

/* GET home page. */
router.get('/', function (req, res, next) {
  db.query(
    `SELECT 
    COUNT(*) AS total_rows
     FROM article;`,
    (err, data, field) => {
      if (err) {
        console.error(err)
      } else {
        res.send(data)
      }
    },
  )
})

module.exports = router
