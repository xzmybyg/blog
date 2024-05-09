//搭建路由表
// import { Navigate } from "react-router-dom"
import { lazy } from "react"

import SecondRoute from "@/components/SecondRoute"

import {
  DesktopOutlined,
  FileOutlined,
  HomeOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons"

//文章版块的二级路由
const articleRoutes = [
  {
    path: "/article/",
    name: "文章列表",
    icon: <DesktopOutlined />,
    component: lazy(
      () => import(/* webpackChunkName:"Article" */ "@/pages/Article")
    ),
    meta: {
      showOnMenu: true,
    },
  },
  {
    path: "/article/addArticle",
    name: "添加文章",
    icon: <PieChartOutlined />,
    component: lazy(
      () =>
        import(/* webpackChunkName:"Article" */ "@/pages/Article/AddArticle")
    ), ///* webpackChunkName:"Article" */3个组件打包在一起
    meta: {
      showOnMenu: true,
    },
  },
]

//一级路由
const routes = [
  {
    path: "/",
    name: "首页",
    icon: <HomeOutlined />,
    component: lazy(() => import("@/pages/Home")), //由于遇到Navigate直接跳转，所以要用函数包起来，等匹配的时候执行
  },
  {
    path: "/article",
    name: "文章管理",
    icon: <PieChartOutlined />,
    component: SecondRoute, //这样只是导入A组件，并非执行  <A/> 这样才算调用执行
    meta: {},
    children: articleRoutes,
  },
  {
    path: "/user",
    name: "用户管理",
    icon: <DesktopOutlined />,
    component: lazy(() => import("@/pages/User")), // 单独打包一个JS 按需导入 懒加载
    meta: {},
  },
  {
    path: "/link",
    name: "友链管理",
    icon: <UserOutlined />,
    component: lazy(() => import("@/pages/TheLink")), // 单独打包一个JS 按需导入 懒加载
    meta: {},
  },
  {
    path: "/label",
    component: lazy(() => import("@/pages/LabelAdmin")),
    name: "标签管理",
    icon: <TeamOutlined />,
    meta: {
      showOnMenu: true,
    },
  },
  {
    path: "/comment",
    component: lazy(() => import("@/pages/Comment")),
    name: "评论管理",
    icon: <FileOutlined />,
    meta: {
      showOnMenu: true,
    },
  },
  {
    path: "/message",
    component: lazy(() => import("@/pages/MessageAdmin")),
    name: "留言管理",
    icon: <FileOutlined />,
    meta: {
      showOnMenu: true,
    },
  },
  {
    path: "/login",
    component: lazy(() => import("@/pages/Login")),
    name: "登录",
    icon: <PieChartOutlined />,
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
