const crypto = require('crypto')
const express = require('express')
const fs = require('fs/promises')
const path = require('path')
const checkRole = require('@middleware/checkRole')
const { uploadLimiter } = require('@middleware/rateLimit')

const router = express.Router()
const coverDirectory = path.join(__dirname, '../public/article-covers')
const maxFileSize = 8 * 1024 * 1024
const imageTypes = new Map([
  ['image/jpeg', { extension: 'jpg', signature: (content) => content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff }],
  ['image/png', { extension: 'png', signature: (content) => content.length >= 8 && content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) }],
  ['image/webp', { extension: 'webp', signature: (content) => content.length >= 12 && content.toString('ascii', 0, 4) === 'RIFF' && content.toString('ascii', 8, 12) === 'WEBP' }],
])

function detectImageType(content) {
  for (const [mimeType, definition] of imageTypes) {
    if (definition.signature(content)) return { mimeType, extension: definition.extension }
  }
  return null
}

function readImageBody(req, res, next) {
  if (!imageTypes.has(req.get('Content-Type')?.split(';')[0])) return res.status(415).send('Unsupported image type')
  if (Number(req.get('Content-Length')) > maxFileSize) return res.status(413).send('Image file is too large')

  const chunks = []
  let size = 0
  req.on('data', (chunk) => {
    size += chunk.length
    if (size <= maxFileSize) chunks.push(chunk)
  })
  req.on('end', () => {
    if (size > maxFileSize) return res.status(413).send('Image file is too large')
    req.body = Buffer.concat(chunks)
    next()
  })
  req.on('error', next)
}

function isValidFileName(fileName) {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/.test(fileName)
}

async function getCoverInfo(fileName) {
  const stat = await fs.stat(path.join(coverDirectory, fileName))
  return {
    name: fileName,
    url: `/api/article-cover/${encodeURIComponent(fileName)}`,
    size: stat.size,
    updatedAt: stat.mtime.toISOString(),
  }
}

router.get('/', checkRole, async function (_req, res) {
  try {
    await fs.mkdir(coverDirectory, { recursive: true })
    const entries = await fs.readdir(coverDirectory, { withFileTypes: true })
    const covers = await Promise.all(entries.filter((entry) => entry.isFile()).map((entry) => getCoverInfo(entry.name)))
    covers.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    res.send(covers)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
})

router.post('/', checkRole, uploadLimiter, readImageBody, async function (req, res) {
  const imageType = Buffer.isBuffer(req.body) && detectImageType(req.body)
  if (!imageType) return res.status(415).send('Unsupported image type')

  const fileName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${imageType.extension}`
  try {
    await fs.mkdir(coverDirectory, { recursive: true })
    await fs.writeFile(path.join(coverDirectory, fileName), req.body, { flag: 'wx' })
    res.status(201).send(await getCoverInfo(fileName))
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
})

router.put('/:fileName', checkRole, uploadLimiter, readImageBody, async function (req, res) {
  const { fileName } = req.params
  const imageType = Buffer.isBuffer(req.body) && detectImageType(req.body)
  if (!isValidFileName(fileName) || !imageType) return res.status(400).send('Invalid article cover')
  const coverFile = path.join(coverDirectory, fileName)
  const temporaryFile = `${coverFile}.${process.pid}.${Date.now()}.tmp`
  try {
    await fs.access(coverFile)
    await fs.writeFile(temporaryFile, req.body)
    await fs.rename(temporaryFile, coverFile)
    res.send(await getCoverInfo(fileName))
  } catch (error) {
    await fs.rm(temporaryFile, { force: true }).catch(() => {})
    if (error.code === 'ENOENT') return res.status(404).send('Article cover not found')
    console.error(error)
    res.status(500).send('Server error')
  }
})

router.get('/:fileName', async function (req, res) {
  const { fileName } = req.params
  if (!isValidFileName(fileName)) return res.status(404).send('Article cover not found')
  try {
    const content = await fs.readFile(path.join(coverDirectory, fileName))
    const imageType = detectImageType(content)
    if (!imageType) return res.status(415).send('Unsupported image type')
    res.set('Cache-Control', 'no-cache').type(imageType.mimeType).send(content)
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).send('Article cover not found')
    console.error(error)
    res.status(500).send('Server error')
  }
})

module.exports = router
