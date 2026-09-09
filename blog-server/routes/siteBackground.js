const express = require('express')
const fs = require('fs/promises')
const path = require('path')
const checkRole = require('@middleware/checkRole')

const router = express.Router()
const backgroundDirectory = path.join(__dirname, '../public/site-backgrounds')
const backgroundTypes = new Set(['home', 'message'])
const maxFileSize = 8 * 1024 * 1024
const acceptedContentTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

function getBackgroundFile(type) {
  return path.join(backgroundDirectory, type)
}

function detectImageType(content) {
  if (content.length >= 8 && content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png'
  }
  if (content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff) {
    return 'image/jpeg'
  }
  if (content.length >= 12 && content.toString('ascii', 0, 4) === 'RIFF' && content.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp'
  }
  return null
}

function validateBackgroundType(req, res, next) {
  if (!backgroundTypes.has(req.params.type)) {
    return res.status(404).send('Background not found')
  }
  next()
}

function readImageBody(req, res, next) {
  const contentType = req.get('Content-Type')?.split(';')[0]
  if (!acceptedContentTypes.has(contentType)) {
    return res.status(415).send('Unsupported image type')
  }
  if (Number(req.get('Content-Length')) > maxFileSize) {
    return res.status(413).send('Image file is too large')
  }

  const chunks = []
  let size = 0
  let tooLarge = false
  req.on('data', (chunk) => {
    size += chunk.length
    if (size > maxFileSize) {
      tooLarge = true
      return
    }
    chunks.push(chunk)
  })
  req.on('end', () => {
    if (tooLarge) return res.status(413).send('Image file is too large')
    req.body = Buffer.concat(chunks)
    next()
  })
  req.on('error', next)
}

router.get('/:type/info', validateBackgroundType, async function (req, res) {
  try {
    const stat = await fs.stat(getBackgroundFile(req.params.type))
    res.set('Cache-Control', 'no-store')
    res.send({
      exists: true,
      size: stat.size,
      updatedAt: stat.mtime.toISOString(),
      url: `/api/site-background/${req.params.type}`,
    })
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.set('Cache-Control', 'no-store')
      return res.send({ exists: false })
    }
    console.error(error)
    res.status(500).send('Server error')
  }
})

router.get('/:type', validateBackgroundType, async function (req, res) {
  try {
    const content = await fs.readFile(getBackgroundFile(req.params.type))
    const mimeType = detectImageType(content)
    if (!mimeType) return res.status(415).send('Unsupported image type')
    res.set('Cache-Control', 'no-cache')
    res.type(mimeType).send(content)
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).send('Background not found')
    console.error(error)
    res.status(500).send('Server error')
  }
})

router.put(
  '/:type',
  validateBackgroundType,
  checkRole,
  readImageBody,
  async function (req, res) {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).send('Image file is required')
    }
    const mimeType = detectImageType(req.body)
    if (!mimeType) return res.status(415).send('Unsupported image type')

    const backgroundFile = getBackgroundFile(req.params.type)
    const temporaryFile = `${backgroundFile}.${process.pid}.${Date.now()}.tmp`
    try {
      await fs.mkdir(backgroundDirectory, { recursive: true })
      await fs.writeFile(temporaryFile, req.body)
      await fs.rename(temporaryFile, backgroundFile)
      const stat = await fs.stat(backgroundFile)
      res.send({
        exists: true,
        size: stat.size,
        updatedAt: stat.mtime.toISOString(),
        url: `/api/site-background/${req.params.type}`,
      })
    } catch (error) {
      console.error(error)
      await fs.rm(temporaryFile, { force: true }).catch(() => {})
      res.status(500).send('Server error')
    }
  },
)

module.exports = router
