const express = require('express')
const checkToken = require('@middleware/checkToken')
const { rateLimitConfigLimiter } = require('@middleware/rateLimit')
const {
  getRateLimitRules,
  rateLimitDefinitions,
  validateRateLimitRule,
} = require('@middleware/rateLimitConfig')
const { deleteRateLimitRule, saveRateLimitRule } = require('../services/rateLimitConfig')

const router = express.Router()

function checkConfigAccess(req, res, next) {
  if (!['admin', 'viewer'].includes(req.user.role)) return res.status(403).send('Forbidden')
  next()
}

function checkAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).send('Forbidden')
  next()
}

router.options('*', function (_req, res) {
  res.sendStatus(204)
})
router.use(rateLimitConfigLimiter, checkToken, checkConfigAccess)

router.get('/', function (_req, res) {
  res.set('Cache-Control', 'no-store')
  res.send(getRateLimitRules())
})

router.put('/:key', checkAdmin, async function (req, res) {
  const { key } = req.params
  if (!rateLimitDefinitions[key]) return res.status(404).send({ message: '限流规则不存在' })
  const rule = validateRateLimitRule(req.body)
  if (!rule) return res.status(400).send({ message: '限流次数或统计窗口无效' })

  try {
    res.send(await saveRateLimitRule(key, rule, req.user.id))
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: '限流配置保存失败' })
  }
})

router.delete('/:key', checkAdmin, async function (req, res) {
  const { key } = req.params
  if (!rateLimitDefinitions[key]) return res.status(404).send({ message: '限流规则不存在' })

  try {
    res.send(await deleteRateLimitRule(key))
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: '限流配置重置失败' })
  }
})

module.exports = router
