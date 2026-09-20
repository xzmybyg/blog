# 心中没有白月光的个人博客

## 项目简介

**博客地址：** [心中没有白月光的博客](https://www.xzmybyg.cn/)

本站前端采用React + Ant Design + vite，后续将采用next.js做seo重构

本站后台管理系统，与博客前台使用相同技术栈（90%）

后端采用 node express + mysql

部署到阿里云服务器，nginx代理服务

## 目录结构

前端项目

- blog-web为博客前台
- blog-admin为后台管理系统

后端项目

- blog-server为服务端

## 启动项目

依赖下载

```cmd
pnpm i
```

在blog-server/config目录下添加

- sqlconfig.js

  ```js
  const sqlconfig = {
    host: 'your_host',
    user: 'your_username',
    password: 'your_password',
    port: 'your_port',
    database: 'your_database',
  }

  module.exports = sqlconfig
  ```

- qiniuconfig.js

  ```js
  const qiniuconfig = {
    accessKey: 'your_accessKey',
    secretKey: 'your_secretKey',
    scope: 'your_scope',
    fromRegionId: 'your_fromRegionId',
  }

  module.exports = qiniuconfig
  ```

在blog-server/uitls目录下添加key.js

```js
const key = 'your_jwt_key'

module.exports = key
```

启动项目

```
//全部项目
pnpm -r run dev

//启动单一项目
pnpm -F blog-web run dev
```

## 服务端限流配置

先执行 `blog-server/migrations/008_add_rate_limit_config.sql` 创建配置表，即可在管理后台“限流配置”页面修改规则并立即生效。后台配置优先于环境变量；恢复默认会回到环境变量或系统默认值。

限流基线也可通过系统环境变量或 `blog-server/.env.production` 配置，格式为 `最大请求数/统计窗口`，例如 `10/5m` 表示 5 分钟内最多请求 10 次。时间支持 `ms`（毫秒）、`s`（秒）、`m`（分钟）、`h`（小时）和 `d`（天）；未配置或格式无效时使用默认值。

| 接口类型 | 配置变量（默认值） |
| --- | --- |
| 全部 API | `RATE_LIMIT_GLOBAL=120/1m` |
| 登录 | `RATE_LIMIT_LOGIN=10/10m` |
| 注册 | `RATE_LIMIT_REGISTER=3/1h` |
| 评论、留言和回复 | `RATE_LIMIT_INTERACTION=5/1m` |
| 点赞 | `RATE_LIMIT_LIKE=30/1m` |
| 访问量上报 | `RATE_LIMIT_PAGE_VIEW=30/1m` |
| 文件上传 | `RATE_LIMIT_UPLOAD=10/10m` |
| 登录后的写操作 | `RATE_LIMIT_AUTH_WRITE=30/1m` |

修改生产环境配置后，需要使用 `pm2 restart blog --update-env` 重启服务使其生效。

## MySQL 集成测试

集成测试只读取 `TEST_DB_*` 环境变量，不会回退到服务端使用的 `DB_*`。为避免误操作生产库，`TEST_DB_NAME` 必须包含独立的 `test` 标识（例如 `blog_test`），并且不能与当前 `DB_NAME` 相同。未完整配置时测试会明确标记为跳过。

复制 `blog-server/.env.test.example` 中的变量到测试机或 Jenkins 凭据环境，创建权限受限的专用测试账号和数据库后运行：

```cmd
pnpm test:integration
```

当前集成测试会在单个数据库连接中创建临时表，验证 `008_add_rate_limit_config.sql` 的表结构、基础读写和规则主键唯一约束；连接关闭后临时表自动删除。

## 邮箱找回密码

部署前执行 `blog-server/migrations/010_add_password_reset.sql`，用于扩展密码哈希字段并创建一次性验证码表。随后在 `blog-server/.env.production` 中配置 `SMTP_HOST`、`SMTP_PORT`、`SMTP_SECURE`、`SMTP_USER`、`SMTP_PASSWORD`、`SMTP_FROM` 和随机生成的 `PASSWORD_RESET_PEPPER`。

验证码有效期为 10 分钟，验证成功后立即失效。接口不会向请求方透露邮箱是否已注册；旧账号密码会在成功登录后自动升级为 scrypt 哈希。

## 错误监控

执行 `blog-server/migrations/009_add_error_monitor.sql` 创建错误事件表后，服务端 5xx、前端未捕获异常和进程异常会自动聚合记录，并可在管理后台“错误监控”页面查看和处理。`viewer` 角色仅可查看。

健康检查地址为 `/api/health`，数据库不可用时返回 HTTP 503。生产环境可由服务器外部的可用性监控服务定时访问该地址。

前端错误默认只在生产构建中上报；如需在开发环境测试，可设置：

```env
VITE_ERROR_REPORTING_ENABLED=true
```
