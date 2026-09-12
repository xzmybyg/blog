function getIpKey(req) {
  return `ip:${req.ip || req.socket?.remoteAddress || 'unknown'}`
}

function getUserOrIpKey(req) {
  return req.user?.id ? `user:${req.user.id}` : getIpKey(req)
}

function createRateLimiter({ windowMs, max, keyGenerator = getIpKey, message = '请求过于频繁，请稍后重试' }) {
  const hits = new Map()
  const maxTrackedKeys = 10000
  let nextCleanupAt = Date.now() + windowMs

  return function rateLimiter(req, res, next) {
    if (req.method === 'OPTIONS') return next()

    const now = Date.now()
    if (now >= nextCleanupAt) {
      for (const [key, entry] of hits) {
        if (entry.resetAt <= now) hits.delete(key)
      }
      nextCleanupAt = now + windowMs
    }

    const key = String(keyGenerator(req))
    let entry = hits.get(key)
    if (!entry || entry.resetAt <= now) {
      if (!entry && hits.size >= maxTrackedKeys) {
        hits.delete(hits.keys().next().value)
      }
      entry = { count: 0, resetAt: now + windowMs }
    }
    entry.count += 1
    hits.set(key, entry)

    const retryAfter = Math.max(Math.ceil((entry.resetAt - now) / 1000), 1)
    res.set('RateLimit-Limit', String(max))
    res.set('RateLimit-Remaining', String(Math.max(max - entry.count, 0)))
    res.set('RateLimit-Reset', String(retryAfter))

    if (entry.count > max) {
      res.set('Retry-After', String(retryAfter))
      return res.status(429).send({ message, retryAfter })
    }

    next()
  }
}

const globalApiLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 120 })
const loginLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: '登录尝试过于频繁，请稍后重试',
})
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: '注册尝试过于频繁，请稍后重试',
})
const interactionLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: getUserOrIpKey,
  message: '发布过于频繁，请稍后再试',
})
const likeLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 30 })
const pageViewLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 30 })
const uploadLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyGenerator: getUserOrIpKey,
  message: '上传过于频繁，请稍后重试',
})
const authenticatedWriteLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: getUserOrIpKey,
  message: '操作过于频繁，请稍后重试',
})

module.exports = {
  createRateLimiter,
  globalApiLimiter,
  loginLimiter,
  registerLimiter,
  interactionLimiter,
  likeLimiter,
  pageViewLimiter,
  uploadLimiter,
  authenticatedWriteLimiter,
}
