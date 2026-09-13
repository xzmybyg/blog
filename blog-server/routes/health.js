const express = require('express')
const db = require('@utils/mysqlUtils')

const router = express.Router()

router.get('/', async function (_req, res) {
  res.locals.skipErrorMonitor = true
  try {
    await db.promise().query('SELECT 1')
    res.set('Cache-Control', 'no-store')
    res.send({ status: 'ok', database: 'ok', uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString() })
  } catch (error) {
    res.status(503).send({ status: 'error', database: 'unavailable', uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString() })
  }
})

module.exports = router
