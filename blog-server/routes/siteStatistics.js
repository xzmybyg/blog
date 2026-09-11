const express = require('express')
const db = require('@utils/mysqlUtils')
const hashVisitorId = require('@utils/visitorId')

const router = express.Router()

router.get('/', function (_req, res) {
  db.query(
    `SELECT
       COALESCE((SELECT visits FROM blog WHERE id = 1), 0) AS pageViews,
       (SELECT COUNT(*) FROM site_visitor) AS uniqueVisitors`,
    (error, rows) => {
      if (error) {
        console.error(error)
        return res.status(500).send('Server error')
      }

      res.send({
        pageViews: Number(rows[0]?.pageViews || 0),
        uniqueVisitors: Number(rows[0]?.uniqueVisitors || 0),
      })
    },
  )
})

router.post('/view', async function (req, res) {
  const visitorHash = hashVisitorId(req.body.visitorId)
  let connection

  try {
    connection = await db.promise().getConnection()
    await connection.beginTransaction()

    if (visitorHash) {
      await connection.query('INSERT IGNORE INTO site_visitor (visitor_hash) VALUES (?)', [visitorHash])
    }
    await connection.query(
      `INSERT INTO blog (id, visits, createDate)
       VALUES (1, 1, NOW())
       ON DUPLICATE KEY UPDATE visits = COALESCE(visits, 0) + 1`,
    )

    await connection.commit()
    res.status(204).end()
  } catch (error) {
    if (connection) await connection.rollback()
    console.error(error)
    res.status(500).send('Server error')
  } finally {
    connection?.release()
  }
})

module.exports = router
