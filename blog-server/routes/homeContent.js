const express = require('express')
const fs = require('fs/promises')
const path = require('path')
const checkRole = require('@middleware/checkRole')

const router = express.Router()
const contentFile = path.join(process.cwd(), 'public', 'home-content.json')
const defaultContent = {
  eyebrow: 'FRONTEND FIELD NOTES · BEIJING',
  title: '把复杂的问题，\n写成清晰的答案。',
  authorName: '心中没有白月光',
  description: '这里记录前端工程、产品体验和持续学习中的真实解法。',
  typedTexts: ['一名前端开发工程师', 'A Web <Developer />'],
}

async function readContent() {
  try {
    const content = JSON.parse(await fs.readFile(contentFile, 'utf8'))
    return { ...defaultContent, ...content }
  } catch (error) {
    if (error.code === 'ENOENT') return defaultContent
    throw error
  }
}

function validateContent(content) {
  const textFields = ['eyebrow', 'title', 'authorName', 'description']
  const hasInvalidText = textFields.some((field) => typeof content[field] !== 'string' || !content[field].trim())
  const typedTexts = Array.isArray(content.typedTexts)
    ? content.typedTexts.map((text) => String(text).trim()).filter(Boolean)
    : []

  if (hasInvalidText || typedTexts.length === 0 || typedTexts.length > 8) return null
  if (content.eyebrow.length > 80 || content.title.length > 120 || content.authorName.length > 40 || content.description.length > 300) return null
  if (typedTexts.some((text) => text.length > 80)) return null

  return {
    eyebrow: content.eyebrow.trim(),
    title: content.title.trim(),
    authorName: content.authorName.trim(),
    description: content.description.trim(),
    typedTexts,
  }
}

router.get('/', async function (_req, res) {
  try {
    res.set('Cache-Control', 'no-store')
    res.send(await readContent())
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
})

router.put('/', checkRole, async function (req, res) {
  const content = validateContent(req.body || {})
  if (!content) return res.status(400).send({ message: '首页文案内容不完整或长度超出限制' })

  const temporaryFile = `${contentFile}.${process.pid}.${Date.now()}.tmp`
  try {
    await fs.mkdir(path.dirname(contentFile), { recursive: true })
    await fs.writeFile(temporaryFile, JSON.stringify(content, null, 2), 'utf8')
    await fs.rename(temporaryFile, contentFile)
    res.send(content)
  } catch (error) {
    console.error(error)
    await fs.rm(temporaryFile, { force: true }).catch(() => {})
    res.status(500).send('Server error')
  }
})

module.exports = router
