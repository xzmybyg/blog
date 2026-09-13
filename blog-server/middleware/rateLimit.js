function getIpKey(req) {
  return `ip:${req.ip || req.socket?.remoteAddress || 'unknown'}`
}

function getUserOrIpKey(req) {
  return req.user?.id ? `user:${req.user.id}` : getIpKey(req)
}

const { getRateLimitRule } = require('./rateLimitConfig')

function createRateLimiter({
  ruleKey,
  windowMs,
  max,
  keyGenerator = getIpKey,
  message = '请求过于频繁，请稍后重试',
  skip = () => false,
}) {
  const hits = new Map()
  const maxTrackedKeys = 10000
  let appliedVersion = null
  let nextCleanupAt = Date.now() + (windowMs || 0)

  return function rateLimiter(req, res, next) {
    if (req.method === 'OPTIONS' || skip(req)) return next()

    const now = Date.now()
    const rule = ruleKey ? getRateLimitRule(ruleKey) : { max, windowMs, version: 0 }
    if (!rule) return next()
    if (appliedVersion !== rule.version) {
      hits.clear()
      appliedVersion = rule.version
      nextCleanupAt = now + rule.windowMs
    }

    if (now >= nextCleanupAt) {
      for (const [key, entry] of hits) {
        if (entry.resetAt <= now) hits.delete(key)
      }
      nextCleanupAt = now + rule.windowMs
    }

    const key = String(keyGenerator(req))
    let entry = hits.get(key)
    if (!entry || entry.resetAt <= now) {
      if (!entry && hits.size >= maxTrackedKeys) {
        hits.delete(hits.keys().next().value)
      }
      entry = { count: 0, resetAt: now + rule.windowMs }
    }
    entry.count += 1
    hits.set(key, entry)

    const retryAfter = Math.max(Math.ceil((entry.resetAt - now) / 1000), 1)
    res.set('RateLimit-Limit', String(rule.max))
    res.set('RateLimit-Remaining', String(Math.max(rule.max - entry.count, 0)))
    res.set('RateLimit-Reset', String(retryAfter))

    if (entry.count > rule.max) {
      res.set('Retry-After', String(retryAfter))
      return res.status(429).send({ message, retryAfter })
    }

    next()
  }
}

function isRateLimitConfigRequest(req) {
  const pathname = String(req.originalUrl || '').split('?')[0]
  return pathname === '/api/rate-limit-config' || pathname.startsWith('/api/rate-limit-config/')
}

const globalApiLimiter = createRateLimiter({ ruleKey: 'global', skip: isRateLimitConfigRequest })
const loginLimiter = createRateLimiter({
  ruleKey: 'login',
  message: '登录尝试过于频繁，请稍后重试',
})
const registerLimiter = createRateLimiter({
  ruleKey: 'register',
  message: '注册尝试过于频繁，请稍后重试',
})
const interactionLimiter = createRateLimiter({
  ruleKey: 'interaction',
  keyGenerator: getUserOrIpKey,
  message: '发布过于频繁，请稍后再试',
})
const likeLimiter = createRateLimiter({ ruleKey: 'like' })
const pageViewLimiter = createRateLimiter({ ruleKey: 'pageView' })
const uploadLimiter = createRateLimiter({
  ruleKey: 'upload',
  keyGenerator: getUserOrIpKey,
  message: '上传过于频繁，请稍后重试',
})
const authenticatedWriteLimiter = createRateLimiter({
  ruleKey: 'authWrite',
  keyGenerator: getUserOrIpKey,
  message: '操作过于频繁，请稍后重试',
})
const rateLimitConfigLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 30 })
const errorReportLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 10 })

module.exports = {
  createRateLimiter,
  globalApiLimiter,
  loginLimiter,
  registerLimiter,
  interactionLimiter,
  likeLimiter,
  pageViewLimiter,
  rateLimitConfigLimiter,
  uploadLimiter,
  authenticatedWriteLimiter,
  errorReportLimiter,
}
