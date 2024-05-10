//搭建路由表
// import { Navigate } from "react-router-dom"
import { lazy } from "react"

import SecondRoute from "@/components/SecondRoute"

//文章版块的二级路由
const articleRoutes = [
  {
    path: "/article/",
    name: "文章列表",
    icon: "icon-liebiao",
    component: lazy(
      () => import(/* webpackChunkName:"Article" */ "@/pages/Article")
    ),
    meta: {
      showOnMenu: true,
      level: 2,
    },
  },
  {
    path: "/article/addArticle",
    name: "添加文章",
    icon: "icon-bianjiwenzhang_huaban",
    component: lazy(
      () =>
        import(/* webpackChunkName:"Article" */ "@/pages/Article/AddArticle")
    ), ///* webpackChunkName:"Article" */3个组件打包在一起
    meta: {
      showOnMenu: true,
      level: 2,
    },
  },
]

//一级路由
const routes = [
  {
    path: "/",
    name: "首页",
    icon: "icon-shouye",
    component: lazy(() => import("@/pages/Home")), //由于遇到Navigate直接跳转，所以要用函数包起来，等匹配的时候执行
    meta: {
      showOnMenu: true,
      level: 1,
    },
  },
  {
    path: "/article",
    name: "文章管理",
    icon: "icon-wenzhang",
    component: SecondRoute, //这样只是导入A组件，并非执行  <A/> 这样才算调用执行
    meta: {
      showOnMenu: true,
      level: 1,
    },
    children: articleRoutes,
  },
  {
    path: "/user",
    name: "用户管理",
    icon: "icon-yonghuguanli",
    component: lazy(() => import("@/pages/User")), // 单独打包一个JS 按需导入 懒加载
    meta: {
      showOnMenu: true,
      level: 1,
    },
  },
  {
    path: "/link",
    name: "友链管理",
    icon: "icon-lianjie",
    component: lazy(() => import("@/pages/TheLink")), // 单独打包一个JS 按需导入 懒加载
    meta: {
      showOnMenu: true,
      level: 1,
    },
  },
  {
    path: "/label",
    component: lazy(() => import("@/pages/LabelAdmin")),
    name: "标签管理",
    icon: "icon-biaoqian",
    meta: {
      showOnMenu: true,
      level: 1,
    },
  },
  {
    path: "/comment",
    component: lazy(() => import("@/pages/Comment")),
    name: "评论管理",
    icon: "icon-liuyan",
    meta: {
      showOnMenu: true,
      level: 1,
    },
  },
  {
    path: "/message",
    component: lazy(() => import("@/pages/MessageAdmin")),
    name: "留言管理",
    icon: "icon-liuyan",
    meta: {
      showOnMenu: true,
      level: 1,
    },
  },
  {
    path: "/login",
    component: lazy(() => import("@/pages/Login")),
    name: "登录",
    icon: "icon-denglu1",
    meta: {
      showOnMenu: true,
    },
  },
  {
    path: "*",
    component: <NotFound />,
    name: "404",
    meta: {
      showOnMenu: false,
    },
  },
]
export default routes
