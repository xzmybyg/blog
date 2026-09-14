const express = require('express')
const db = require('@utils/mysqlUtils')

const router = express.Router()

function getHealthPayload(status, database) {
  return {
    status,
    database,
    release: process.env.RELEASE_SHA || 'development',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  }
}

router.get('/', async function (_req, res) {
  res.locals.skipErrorMonitor = true
  try {
    await db.promise().query('SELECT 1')
    res.set('Cache-Control', 'no-store')
    res.send(getHealthPayload('ok', 'ok'))
  } catch (error) {
    res.status(503).send(getHealthPayload('error', 'unavailable'))
  }
})

module.exports = router
