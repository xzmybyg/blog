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
