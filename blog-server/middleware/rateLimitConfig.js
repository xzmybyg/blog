const MIN_WINDOW_MS = 100
const MAX_WINDOW_MS = 30 * 24 * 60 * 60 * 1000
const MAX_REQUESTS = 100000

const rateLimitDefinitions = Object.freeze({
  global: { label: '全部 API', description: '所有 /api 请求的基础保护', envName: 'RATE_LIMIT_GLOBAL', max: 120, windowMs: 60 * 1000 },
  login: { label: '登录', description: '按 IP 限制登录尝试', envName: 'RATE_LIMIT_LOGIN', max: 10, windowMs: 10 * 60 * 1000 },
  register: { label: '注册', description: '按 IP 限制账号注册', envName: 'RATE_LIMIT_REGISTER', max: 3, windowMs: 60 * 60 * 1000 },
  interaction: { label: '评论与留言', description: '按用户限制评论、留言和回复', envName: 'RATE_LIMIT_INTERACTION', max: 5, windowMs: 60 * 1000 },
  like: { label: '点赞', description: '按 IP 限制点赞请求', envName: 'RATE_LIMIT_LIKE', max: 30, windowMs: 60 * 1000 },
  pageView: { label: '访问量上报', description: '按 IP 限制访问统计上报', envName: 'RATE_LIMIT_PAGE_VIEW', max: 30, windowMs: 60 * 1000 },
  upload: { label: '文件上传', description: '按管理员限制文件上传', envName: 'RATE_LIMIT_UPLOAD', max: 10, windowMs: 10 * 60 * 1000 },
  authWrite: { label: '后台写操作', description: '按管理员限制新增、编辑和删除操作', envName: 'RATE_LIMIT_AUTH_WRITE', max: 30, windowMs: 60 * 1000 },
})

const unitMs = Object.freeze({ ms: 1, s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 })
const baselineRules = new Map()
const activeRules = new Map()

function validateRateLimitRule(rule) {
  const max = Number(rule?.max)
  const windowMs = Number(rule?.windowMs)
  if (!Number.isSafeInteger(max) || max <= 0 || max > MAX_REQUESTS) return null
  if (!Number.isSafeInteger(windowMs) || windowMs < MIN_WINDOW_MS || windowMs > MAX_WINDOW_MS) return null
  return { max, windowMs }
}

function parseRateLimitExpression(value) {
  const match = typeof value === 'string' && value.trim().match(/^(\d+)\/(\d+)(ms|s|m|h|d)$/i)
  if (!match) return null
  return validateRateLimitRule({
    max: Number(match[1]),
    windowMs: Number(match[2]) * unitMs[match[3].toLowerCase()],
  })
}

function createRule(key, values, source, version) {
  const definition = rateLimitDefinitions[key]
  return Object.freeze({
    key,
    label: definition.label,
    description: definition.description,
    max: values.max,
    windowMs: values.windowMs,
    source,
    version,
  })
}

for (const [key, definition] of Object.entries(rateLimitDefinitions)) {
  const environmentRule = parseRateLimitExpression(process.env[definition.envName])
  const source = environmentRule ? 'environment' : 'default'
  const baseline = createRule(key, environmentRule || definition, source, 1)
  baselineRules.set(key, baseline)
  activeRules.set(key, baseline)
}

function getRateLimitRule(key) {
  return activeRules.get(key)
}

function getRateLimitRules() {
  return Object.keys(rateLimitDefinitions).map((key) => activeRules.get(key))
}

function setRateLimitRule(key, values, source = 'database') {
  if (!rateLimitDefinitions[key]) return null
  const rule = validateRateLimitRule(values)
  if (!rule) return null
  const version = (activeRules.get(key)?.version || 0) + 1
  const nextRule = createRule(key, rule, source, version)
  activeRules.set(key, nextRule)
  return nextRule
}

function resetRateLimitRule(key) {
  const baseline = baselineRules.get(key)
  if (!baseline) return null
  return setRateLimitRule(key, baseline, baseline.source)
}

function applyStoredRateLimitRules(rows) {
  for (const key of Object.keys(rateLimitDefinitions)) resetRateLimitRule(key)
  for (const row of rows) {
    setRateLimitRule(row.rule_key, { max: row.max_requests, windowMs: row.window_ms })
  }
}

module.exports = {
  MAX_REQUESTS,
  MAX_WINDOW_MS,
  MIN_WINDOW_MS,
  applyStoredRateLimitRules,
  getRateLimitRule,
  getRateLimitRules,
  parseRateLimitExpression,
  rateLimitDefinitions,
  resetRateLimitRule,
  setRateLimitRule,
  validateRateLimitRule,
}
