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

限流参数可通过系统环境变量或 `blog-server/.env.production` 配置，格式为 `最大请求数/统计窗口`，例如 `10/5m` 表示 5 分钟内最多请求 10 次。时间支持 `ms`（毫秒）、`s`（秒）、`m`（分钟）、`h`（小时）和 `d`（天）；未配置或格式无效时使用默认值。

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
