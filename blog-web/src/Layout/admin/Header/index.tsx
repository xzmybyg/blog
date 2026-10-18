import useUserStore from '@/store/user'
import useThemeStore from '@/store/theme'
import './index.scss'
import { Breadcrumb, Layout, Popover } from 'antd'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import routes from '@/router/routes'
import { DEFAULT_USER_AVATAR } from '@/utils/avatar'
const { Header } = Layout

export default function AdminHeader() {
  const { id, username, nickname, avatar } = useUserStore()
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const navigate = useNavigate()
  const router = useLocation()

  const getBreadcrumbItems = (currentPath: string): { title: string }[] => {
    const pathnames = currentPath.split('/').filter((x) => x)

    const breadcrumbItems: { title: string }[] = []
    let list = routes

    for (let i = 0; i < pathnames.length; i++) {
      const routePath = '/' + pathnames.slice(0, i + 1).join('/')
      const route = list.find((route) => route.path === routePath)

      if (route) {
        breadcrumbItems.push({ title: route.name })
        if (route.children) {
          list = route.children
        }
      }
    }

    return breadcrumbItems
  }

  return (
    <Header className="header admin-header">
      <div className="admin-header__context">
        <span className="admin-header__eyebrow">内容工作台 / BLOG STUDIO</span>
        <Breadcrumb items={getBreadcrumbItems(router.pathname)} />
      </div>
      <div className="admin-header__actions">
        <button
          className="admin-header__theme"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
          title={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
        >
          {theme === 'dark' ? <SunOutlined aria-hidden="true" /> : <MoonOutlined aria-hidden="true" />}
        </button>
        {id ? (
          <Popover
            placement="bottomRight"
            content={<button className="admin-header__logout" type="button" onClick={logoutInfo}>退出登录</button>}
          >
            <button className="admin-header__user" type="button">
              <Avatar src={avatar || DEFAULT_USER_AVATAR} />
              <span>{nickname || username}</span>
            </button>
          </Popover>
        ) : (
          <button
            className="admin-header__user"
            type="button"
            onClick={() => {
              navigate('/admin/login')
            }}
          >
            <i className="iconfont icon-denglu1" />
            登录
          </button>
        )}
      </div>
    </Header>
  )
}
