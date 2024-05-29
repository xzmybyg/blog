const mysql = require('mysql2')
const sqlconfig = require('../config/sqlconfig')

const db = mysql.createConnection(sqlconfig)

db.query('select 1', (err, results) => {
  if (err) return console.log(err)
  console.log(results)
})

module.exports = db
