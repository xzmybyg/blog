require('module-alias/register')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '.env') })
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: path.join(__dirname, envFile) })

var createError = require('http-errors')
var express = require('express')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const db = require('@utils/mysqlUtils')
const { globalApiLimiter } = require('@middleware/rateLimit')
const requestContext = require('@middleware/requestContext')
const { reportServerError } = require('@utils/errorMonitor')

var indexRouter = require('@routes/index')
var usersRouter = require('@routes/users')
var articleRouter = require('@routes/article')
var topicRouter = require('@routes/topic')
var labelRouter = require('@routes/label')
var articleTopicRouter = require('@routes/articleTopic')
var linkRouter = require('@routes/link')
var commentRouter = require('@routes/comment')
var messageRouter = require('@routes/message')
var replyRouter = require('@routes/reply')
var qiniuRouter = require('@routes/qiniuSave')
var certificateRouter = require('@routes/certificate')
var aboutRouter = require('@routes/about')
var siteBackgroundRouter = require('@routes/siteBackground')
var articleCoverRouter = require('@routes/articleCover')
var siteStatisticsRouter = require('@routes/siteStatistics')
var homeContentRouter = require('@routes/homeContent')
var siteNoticeRouter = require('@routes/siteNotice')
var rateLimitConfigRouter = require('@routes/rateLimitConfig')
var errorReportRouter = require('@routes/errorReport')
var errorMonitorRouter = require('@routes/errorMonitor')
var healthRouter = require('@routes/health')

var app = express()
const siteUrl = String(process.env.SITE_URL || 'https://www.xzmybyg.cn').replace(/\/$/, '')

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

function startServer() {
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild',
    )
    res.header('Access-Control-Expose-Headers', 'Retry-After, RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, X-Request-Id')
    res.header('X-Powered-By', ' 3.2.1')
    // res.header("Content-Type", "application/json;charset=utf-8")
    next()
  })

  app.use(logger('dev'))
  app.use(requestContext)
  app.use('/api', globalApiLimiter)
  app.use('/api/error-report', errorReportRouter)
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(express.static(path.join(__dirname, 'public')))

  app.use('/api/users', usersRouter)
  app.use('/api/article', articleRouter)
  app.use('/api/topic', topicRouter)
  app.use('/api/label', labelRouter)
  app.use('/api/article-topic', articleTopicRouter)
  app.use('/api/link', linkRouter)
  app.use('/api/comment', commentRouter)
  app.use('/api/message', messageRouter)
  app.use('/api/reply', replyRouter)

  app.use('/api/qiniu', qiniuRouter)
  app.use('/api/certificate', certificateRouter)
  app.use('/api/about', aboutRouter)
  app.use('/api/site-background', siteBackgroundRouter)
  app.use('/api/article-cover', articleCoverRouter)
  app.use('/api/site-statistics', siteStatisticsRouter)
  app.use('/api/home-content', homeContentRouter)
  app.use('/api/site-notice', siteNoticeRouter)
  app.use('/api/rate-limit-config', rateLimitConfigRouter)
  app.use('/api/error-monitor', errorMonitorRouter)
  app.use('/api/health', healthRouter)

  app.get('/robots.txt', function (_req, res) {
    res.type('text/plain').send([
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      `Sitemap: ${siteUrl}/sitemap.xml`,
    ].join('\n'))
  })

  app.get('/sitemap.xml', function (_req, res) {
    db.query(
      'SELECT id, createTime FROM article WHERE hidden = 0 ORDER BY createTime DESC',
      (error, articles) => {
        if (error) {
          console.error(error)
          return res.status(500).type('text/plain').send('Unable to generate sitemap')
        }

        const staticPaths = ['/', '/article', '/about', '/link', '/message']
        const urls = staticPaths.map((pathname) => ({ location: `${siteUrl}${pathname}` }))
        articles.forEach((article) => {
          const date = article.createTime ? new Date(article.createTime) : null
          urls.push({
            location: `${siteUrl}/topic/${encodeURIComponent(article.id)}`,
            lastModified: date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined,
          })
        })

        const body = urls.map(({ location, lastModified }) => [
          '  <url>',
          `    <loc>${escapeXml(location)}</loc>`,
          lastModified ? `    <lastmod>${lastModified}</lastmod>` : '',
          '  </url>',
        ].filter(Boolean).join('\n')).join('\n')

        res
          .set('Cache-Control', 'public, max-age=3600')
          .type('application/xml')
          .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`)
      },
    )
  })

  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/blog/index.html'))
  })

  app.get('*', (req, res) => {
    res.sendFile(`/blog/index.html`, { root: 'public' })
  })

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404))
  })

  // error handler
  app.use(function (err, req, res, _next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    const statusCode = err.status || 500
    if (statusCode >= 500) {
      const errorId = reportServerError(err, req, statusCode)
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(statusCode).send({ message: '服务器内部错误', errorId })
      }
    }

    res.status(statusCode)
    res.sendFile(`/error.html`, { root: 'public' })
  })
}

startServer()

module.exports = app
