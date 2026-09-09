import useUserStore from '@/store/user'
import './index.scss'
import { Breadcrumb, Layout, Popover } from 'antd'
import routes from '@/router/routes'
const { Header } = Layout

export default function AdminHeader() {
  const { id, username, nickname, avatar } = useUserStore()
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
        <span className="admin-header__eyebrow">WORKSPACE / 管理后台</span>
        <Breadcrumb items={getBreadcrumbItems(router.pathname)} />
      </div>
      {id ? (
        <Popover
          placement="bottomRight"
          content={<button className="admin-header__logout" type="button" onClick={logoutInfo}>退出登录</button>}
        >
          <button className="admin-header__user" type="button">
            <Avatar src={avatar} icon={avatar ? null : <i className="iconfont icon-tuichu" />} />
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
    </Header>
  )
}
