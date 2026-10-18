const express = require('express')
const fs = require('fs/promises')
const path = require('path')
const checkRole = require('@middleware/checkRole')

const router = express.Router()
const settingsFile = path.join(process.cwd(), 'public', 'theme-animation.json')
const defaultSettings = { durationMs: 600 }

function validDuration(value) {
  return Number.isInteger(value) && value >= 200 && value <= 1500
}

router.get('/', async function (_req, res) {
  try {
    const settings = JSON.parse(await fs.readFile(settingsFile, 'utf8'))
    res.set('Cache-Control', 'no-store')
    res.send(validDuration(settings.durationMs) ? { durationMs: settings.durationMs } : defaultSettings)
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.set('Cache-Control', 'no-store').send(defaultSettings)
      return
    }
    console.error(error)
    res.status(500).send('Server error')
  }
})

router.put('/', checkRole, async function (req, res) {
  const { durationMs } = req.body || {}
  if (!validDuration(durationMs)) return res.status(400).send({ message: '动画时长须为 200–1500 毫秒的整数' })

  const settings = { durationMs }
  const temporaryFile = `${settingsFile}.${process.pid}.${Date.now()}.tmp`
  try {
    await fs.mkdir(path.dirname(settingsFile), { recursive: true })
    await fs.writeFile(temporaryFile, JSON.stringify(settings, null, 2), 'utf8')
    await fs.rename(temporaryFile, settingsFile)
    res.send(settings)
  } catch (error) {
    console.error(error)
    await fs.rm(temporaryFile, { force: true }).catch(() => {})
    res.status(500).send('Server error')
  }
})

module.exports = router
