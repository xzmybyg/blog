//文章管理版块的二级路由
const articleRoutes = [
  {
    path: '/admin/article/',
    name: '文章列表',
    icon: 'icon-liebiao',
    component: lazy(() => import(/* webpackChunkName:"Article" */ '@/pages/Admin/Article')),
    meta: {
      showOnMenu: true,
    },
  },
  {
    path: '/admin/article/addArticle',
    name: '添加文章',
    icon: 'icon-bianjiwenzhang_huaban',
    component: lazy(() => import(/* webpackChunkName:"Article" */ '@/pages/Admin/Article/AddArticle')), ///* webpackChunkName:"Article" */3个组件打包在一起
    meta: {
      showOnMenu: true,
    },
  },
]

//管理系统路由
const adminRoutes = [
  {
    path: '/admin/',
    name: '首页',
    icon: 'icon-shouye',
    component: lazy(() => import('@/pages/Admin')), //由于遇到Navigate直接跳转，所以要用函数包起来，等匹配的时候执行
    meta: {
      checkAuth: true,
      showOnMenu: true,
      layout: 'admin',
    },
  },
  {
    path: '/admin/article',
    name: '文章管理',
    icon: 'icon-wenzhang',
    component: SecondRoute, //这样只是导入A组件，并非执行  <A/> 这样才算调用执行
    // component: lazy(() => import("@/components/SecondRoute")), //这样只是导入A组件，并非执行  <A/> 这样才算调用执行
    meta: {
      checkAuth: true,
      showOnMenu: true,
      layout: 'admin',
    },
    children: articleRoutes,
  },
  {
    path: '/admin/user',
    name: '用户管理',
    icon: 'icon-yonghuguanli',
    component: lazy(() => import('@/pages/Admin/User')), // 单独打包一个JS 按需导入 懒加载
    meta: {
      checkAuth: true,
      showOnMenu: true,
      layout: 'admin',
    },
  },
  {
    path: '/admin/link',
    name: '友链管理',
    icon: 'icon-lianjie',
    component: lazy(() => import('@/pages/Admin/TheLink')), // 单独打包一个JS 按需导入 懒加载
    meta: {
      checkAuth: true,
      showOnMenu: true,
      layout: 'admin',
    },
  },
  {
    path: '/admin/label',
    component: lazy(() => import('@/pages/Admin/LabelAdmin')),
    name: '标签管理',
    icon: 'icon-biaoqian',
    meta: {
      checkAuth: true,
      showOnMenu: true,
      layout: 'admin',
    },
  },
  {
    path: '/admin/comment',
    component: lazy(() => import('@/pages/Admin/Comment')),
    name: '评论管理',
    icon: 'icon-liuyan',
    meta: {
      checkAuth: true,
      showOnMenu: true,
      layout: 'admin',
    },
  },
  {
    path: '/admin/message',
    component: lazy(() => import('@/pages/Admin/MessageAdmin')),
    name: '留言管理',
    icon: 'icon-liuyan',
    meta: {
      checkAuth: true,
      showOnMenu: true,
      layout: 'admin',
    },
  },
  {
    path: '/admin/login',
    component: lazy(() => import('@/pages/Admin/Login')),
    name: '登录',
    icon: 'icon-denglu1',
    meta: {
      showOnMenu: false,
    },
  },
]

export default adminRoutes
