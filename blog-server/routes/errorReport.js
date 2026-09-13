const express = require('express')
const { errorReportLimiter } = require('@middleware/rateLimit')
const { recordError } = require('@utils/errorMonitor')

const router = express.Router()
const jsonParser = express.json({ limit: '32kb' })

router.post('/', errorReportLimiter, jsonParser, async function (req, res) {
  const body = req.body || {}
  if (typeof body.message !== 'string' || !body.message.trim()) {
    return res.status(400).send({ message: '错误信息不能为空' })
  }

  await recordError({
    source: 'client',
    message: body.message.trim(),
    stack: body.stack,
    route: body.route,
    method: body.method,
    statusCode: body.statusCode,
    requestId: req.requestId,
    userAgent: req.get('User-Agent'),
    context: body.context,
  })
  res.status(204).end()
})

module.exports = router
