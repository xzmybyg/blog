//搭建路由表
import SecondRoute from '@/components/SecondRoute'
import adminRoutes from './adminroutes'

const routes: RouterType[] = [
  {
    path: '/',
    component: lazy(() => import('@/pages/Home')),
    name: '首页',
    icon: 'icon-shouye',
    meta: {
      fontend: true,
    },
  },
  {
    path: '/article',
    component: lazy(() => import('@/pages/Article')),
    name: '文章',
    icon: 'icon-wenzhang',
    meta: {
      fontend: true,
    },
  },
  {
    path: '/topic/:id',
    component: lazy(() => import('@/pages/Topic')),
    name: '话题',
    showOnNav: false,
    meta: {
      fontend: true,
    },
  },
  {
    path: '/about',
    component: lazy(() => import('@/pages/About')),
    name: '关于',
    icon: 'icon-denglu1',
    meta: {
      fontend: true,
    },
  },
  {
    path: '/link',
    component: lazy(() => import('@/pages/TheLink')),
    name: '友链',
    icon: 'icon-lianjie',
    meta: {
      fontend: true,
    },
  },
  {
    path: '/message',
    component: lazy(() => import('@/pages/Message')),
    name: '留言',
    icon: 'icon-liuyan',
    meta: {
      fontend: true,
    },
  },
  {
    path: '/admin',
    component: SecondRoute,
    name: '后台管理',
    showOnNav: false,
    meta: {
      showOnMenu: true,
      level: 1,
    },
    children: adminRoutes,
  },
  {
    path: '*',
    component: lazy(() => import('@/pages/NotFound')),
    name: '404',
    showOnNav: false,
    meta: {
      fontend: true,
    },
  },
]
export default routes
