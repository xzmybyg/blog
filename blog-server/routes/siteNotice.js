const express = require('express')
const fs = require('fs/promises')
const path = require('path')
const checkRole = require('@middleware/checkRole')

const router = express.Router()
const noticeFile = path.join(process.cwd(), 'public', 'site-notice.json')
const defaultNotice = {
  content: '这里记录前端工程、产品体验与持续学习中的真实解法。',
}

async function readNotice() {
  try {
    const notice = JSON.parse(await fs.readFile(noticeFile, 'utf8'))
    return typeof notice.content === 'string' && notice.content.trim()
      ? { content: notice.content }
      : defaultNotice
  } catch (error) {
    if (error.code === 'ENOENT') return defaultNotice
    throw error
  }
}

function validateNotice(notice) {
  if (typeof notice.content !== 'string' || !notice.content.trim() || notice.content.length > 500) return null
  return { content: notice.content.trim() }
}

router.get('/', async function (_req, res) {
  try {
    res.set('Cache-Control', 'no-store')
    res.send(await readNotice())
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
})

router.put('/', checkRole, async function (req, res) {
  const notice = validateNotice(req.body || {})
  if (!notice) return res.status(400).send({ message: '公告内容不完整或长度超出限制' })

  const temporaryFile = `${noticeFile}.${process.pid}.${Date.now()}.tmp`
  try {
    await fs.mkdir(path.dirname(noticeFile), { recursive: true })
    await fs.writeFile(temporaryFile, JSON.stringify(notice, null, 2), 'utf8')
    await fs.rename(temporaryFile, noticeFile)
    res.send(notice)
  } catch (error) {
    console.error(error)
    await fs.rm(temporaryFile, { force: true }).catch(() => {})
    res.status(500).send('Server error')
  }
})

module.exports = router
