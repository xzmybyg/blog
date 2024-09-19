require('module-alias/register')
const dotenv = require('dotenv')
dotenv.config()
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: envFile })

var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const db = require('@utils/mysqlUtils')

var indexRouter = require('@routes/index')
var usersRouter = require('@routes/users')
var articleRouter = require('@routes/article')
var topicRouter = require('@routes/topic')
var labelRouter = require('@routes/label')
var linkRouter = require('@routes/link')
var commentRouter = require('@routes/comment')
var messageRouter = require('@routes/message')
var replyRouter = require('@routes/reply')
var qiniuRouter = require('@routes/qiniuSave')

var app = express()

db.connect(function (err) {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack)
    return
  }
  console.log('Connected to MySQL as id ' + db.threadId + process.env.DB_PORT)
  console.log();
  
  // 启动 Express 服务
  startServer()
})

function startServer() {
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild',
    )
    res.header('X-Powered-By', ' 3.2.1')
    // res.header("Content-Type", "application/json;charset=utf-8")
    next()
  })

  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(express.static(path.join(__dirname, 'public')))

  app.use('/api/users', usersRouter)
  app.use('/api/article', articleRouter)
  app.use('/api/topic', topicRouter)
  app.use('/api/label', labelRouter)
  app.use('/api/link', linkRouter)
  app.use('/api/comment', commentRouter)
  app.use('/api/message', messageRouter)
  app.use('/api/reply', replyRouter)

  app.use('/api/qiniu', qiniuRouter)

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
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.sendFile(`/error.html`, { root: 'public' })
  })
}

module.exports = app
