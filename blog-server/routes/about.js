const express = require('express')
const fs = require('fs/promises')
const path = require('path')
const checkRole = require('@middleware/checkRole')

const router = express.Router()
const aboutFile = path.join(process.cwd(), 'public', 'about.md')
const maxContentLength = 2 * 1024 * 1024
const defaultContent = `# 关于我

1. 主要做前端开发，做过一段时间 C++ 全栈
2. 目前坐标北京
3. 平时喜欢写一些小项目，通过新媒体了解一些前沿的技术
4. 邮箱：1277215827@qq.com

## 我使用的技术

1. 前端：React、Vue、TypeScript
2. 后端：Node、Express、C++
3. 数据库：MySQL、MongoDB
4. 其他：Webpack、Vite

## 关于这个博客

- 博客搭建
- 前端使用 React、Vite、Ant Design、SCSS 搭建
- 后端使用 Node.js、Express 搭建
`

async function readAboutContent() {
  try {
    return await fs.readFile(aboutFile, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') return defaultContent
    throw error
  }
}

router.get('/', async function (_req, res) {
  try {
    res.type('text/markdown').send(await readAboutContent())
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
})

router.put('/', checkRole, async function (req, res) {
  const { content } = req.body

  if (typeof content !== 'string' || !content.trim()) {
    return res.status(400).send('About content is required')
  }
  if (Buffer.byteLength(content, 'utf8') > maxContentLength) {
    return res.status(413).send('About content is too large')
  }

  const temporaryFile = `${aboutFile}.tmp`
  try {
    await fs.mkdir(path.dirname(aboutFile), { recursive: true })
    await fs.writeFile(temporaryFile, content, 'utf8')
    await fs.rename(temporaryFile, aboutFile)
    res.status(200).send('About content updated')
  } catch (error) {
    console.error(error)
    await fs.rm(temporaryFile, { force: true }).catch(() => {})
    res.status(500).send('Server error')
  }
})

module.exports = router
