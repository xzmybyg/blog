const crypto = require('crypto')

const MAX_MESSAGE_LENGTH = 1000
const MAX_STACK_LENGTH = 16000
const MAX_ROUTE_LENGTH = 255
const MAX_USER_AGENT_LENGTH = 500

function getDatabase() {
  return require('./mysqlUtils')
}

function truncate(value, maxLength) {
  return typeof value === 'string' ? value.slice(0, maxLength) : ''
}

function normalizeRoute(value) {
  if (typeof value !== 'string') return ''
  try {
    const url = new URL(value, 'http://localhost')
    return truncate(url.pathname, MAX_ROUTE_LENGTH)
  } catch {
    return truncate(value.split('?')[0], MAX_ROUTE_LENGTH)
  }
}

function sanitizeContext(context) {
  if (!context || typeof context !== 'object' || Array.isArray(context)) return null
  const allowedKeys = ['componentStack', 'browser', 'screen', 'release']
  const safeContext = {}
  for (const key of allowedKeys) {
    if (typeof context[key] === 'string') safeContext[key] = truncate(context[key], 2000)
  }
  return Object.keys(safeContext).length > 0 ? JSON.stringify(safeContext) : null
}

function createRequestId() {
  return `err_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`
}

function normalizeError(input) {
  const source = ['client', 'server', 'process'].includes(input.source) ? input.source : 'server'
  const message = truncate(String(input.message || 'Unknown error'), MAX_MESSAGE_LENGTH)
  const route = normalizeRoute(input.route)
  const method = truncate(String(input.method || '').toUpperCase(), 10)
  const statusCode = Number(input.statusCode)
  const normalizedStatus = Number.isInteger(statusCode) && statusCode >= 100 && statusCode <= 599 ? statusCode : null
  const stack = truncate(String(input.stack || ''), MAX_STACK_LENGTH)
  const fingerprint = crypto
    .createHash('sha256')
    .update([source, method, route, normalizedStatus || '', message, stack.split('\n')[0]].join('|'))
    .digest('hex')

  return {
    fingerprint,
    source,
    level: input.level === 'fatal' ? 'fatal' : 'error',
    message,
    stack: stack || null,
    route: route || null,
    method: method || null,
    statusCode: normalizedStatus,
    requestId: truncate(input.requestId || createRequestId(), 64),
    userAgent: truncate(input.userAgent || '', MAX_USER_AGENT_LENGTH) || null,
    contextJson: sanitizeContext(input.context),
  }
}

async function recordError(input) {
  const error = normalizeError(input)
  console.error(JSON.stringify({ event: 'application_error', ...error, occurredAt: new Date().toISOString() }))

  try {
    await getDatabase().promise().query(
      `INSERT INTO error_event
        (fingerprint, source, level, message, stack, route, method, status_code, request_id, user_agent, context_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         level = VALUES(level),
         message = VALUES(message),
         stack = VALUES(stack),
         request_id = VALUES(request_id),
         user_agent = VALUES(user_agent),
         context_json = VALUES(context_json),
         status_code = VALUES(status_code),
         occurrences = occurrences + 1,
         last_seen_at = CURRENT_TIMESTAMP,
         resolved = 0,
         resolved_at = NULL`,
      [
        error.fingerprint,
        error.source,
        error.level,
        error.message,
        error.stack,
        error.route,
        error.method,
        error.statusCode,
        error.requestId,
        error.userAgent,
        error.contextJson,
      ],
    )
  } catch (databaseError) {
    console.error(`错误事件写入数据库失败：${databaseError.message}`)
  }

  return error.requestId
}

async function cleanupResolvedErrors() {
  try {
    await getDatabase().promise().query(
      'DELETE FROM error_event WHERE resolved = 1 AND resolved_at < DATE_SUB(NOW(), INTERVAL 30 DAY)',
    )
  } catch (error) {
    console.error(`过期错误记录清理失败：${error.message}`)
  }
}

function reportServerError(error, req, statusCode) {
  const requestId = req.requestId || createRequestId()
  if (req.res?.locals) req.res.locals.errorReported = true
  void recordError({
    source: 'server',
    message: error?.message,
    stack: error?.stack,
    route: req.originalUrl,
    method: req.method,
    statusCode,
    requestId,
    userAgent: req.get('User-Agent'),
  })
  return requestId
}

module.exports = {
  cleanupResolvedErrors,
  createRequestId,
  normalizeError,
  recordError,
  reportServerError,
}
