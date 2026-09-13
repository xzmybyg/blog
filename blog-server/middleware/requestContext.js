const { createRequestId, reportServerError } = require('@utils/errorMonitor')

function requestContext(req, res, next) {
  req.requestId = createRequestId()
  res.set('X-Request-Id', req.requestId)

  res.once('finish', () => {
    if (res.statusCode < 500 || res.locals.errorReported || res.locals.skipErrorMonitor) return
    reportServerError(new Error(`HTTP ${res.statusCode}`), req, res.statusCode)
  })

  next()
}

module.exports = requestContext
