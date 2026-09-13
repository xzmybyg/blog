const db = require('@utils/mysqlUtils')
const {
  applyStoredRateLimitRules,
  resetRateLimitRule,
  setRateLimitRule,
} = require('@middleware/rateLimitConfig')

async function initializeRateLimitConfig() {
  try {
    const [rows] = await db.promise().query(
      'SELECT rule_key, max_requests, window_ms FROM rate_limit_config',
    )
    applyStoredRateLimitRules(rows)
  } catch (error) {
    console.error('限流配置加载失败，使用环境变量或默认值：', error.message)
  }
}

async function saveRateLimitRule(key, rule, userId) {
  await db.promise().query(
    `INSERT INTO rate_limit_config (rule_key, max_requests, window_ms, updated_by)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       max_requests = VALUES(max_requests),
       window_ms = VALUES(window_ms),
       updated_by = VALUES(updated_by)`,
    [key, rule.max, rule.windowMs, userId],
  )
  return setRateLimitRule(key, rule)
}

async function deleteRateLimitRule(key) {
  await db.promise().query('DELETE FROM rate_limit_config WHERE rule_key = ?', [key])
  return resetRateLimitRule(key)
}

module.exports = {
  deleteRateLimitRule,
  initializeRateLimitConfig,
  saveRateLimitRule,
}
