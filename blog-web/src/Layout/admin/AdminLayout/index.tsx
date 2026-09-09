import adminroutes from '@/router/adminroutes'
import { ConfigProvider, FloatButton, Layout, Menu } from 'antd'
import './index.scss'

const { Content, Sider } = Layout

import AdminHeader from '@/Layout/admin/Header'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const menuItems = adminroutes.map((item) => {
    if (item.meta?.showOnMenu === false) return null
    return {
      key: item.path,
      icon: <i className={`iconfont ${item?.icon}`}></i>,
      label: item.name,
      children: item?.children?.map((child) => {
        if (child.meta?.showOnMenu === false) return null
        return {
          key: child.path,
          icon: <i className={`iconfont ${child?.icon}`}></i>,
          label: child.name,
        }
      }),
    }
  })
  const [collapsed, setCollapsed] = useState(false)

  const openKeys = (menuList: any[]) => {
    const openKeys: string[] = []

    menuList.forEach((item) => {
      if (item?.children?.length > 0) {
        openKeys.push(item.key)
      }
    })
    return openKeys
  }

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1857d9',
            colorInfo: '#1857d9',
            colorSuccess: '#18794e',
            colorError: '#c83b31',
            colorText: '#122033',
            colorTextSecondary: '#58677c',
            colorBorder: '#d9e1ec',
            colorBgLayout: '#f4f7fb',
            borderRadius: 10,
            fontFamily: "'Microsoft YaHei', 'PingFang SC', system-ui, sans-serif",
          },
          components: {
            Layout: {
              siderBg: '#0d2b55',
              triggerBg: '#092344',
            },
            Menu: {
              darkItemBg: '#0d2b55',
              darkSubMenuItemBg: '#092344',
              darkItemColor: '#c9d6e8',
              darkItemHoverBg: '#163b6b',
              darkItemSelectedBg: '#1857d9',
              darkItemSelectedColor: '#fff',
              itemBorderRadius: 8,
            },
          },
        }}
      >
        <Layout className="admin-shell">
          <Sider
            className="admin-sider"
            width={232}
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
          >
            <div className="admin-brand" aria-label="博客管理后台">
              <span className="admin-brand__mark">&lt;/&gt;</span>
              {!collapsed && (
                <span className="admin-brand__copy">
                  <strong>BLOG CONSOLE</strong>
                  <small>内容管理工作台</small>
                </span>
              )}
            </div>
            <Menu
              className="admin-menu"
              theme="dark"
              selectedKeys={[location.pathname]}
              mode="inline"
              items={menuItems}
              defaultOpenKeys={openKeys(menuItems)}
              onClick={(item) => {
                navigate(item.key)
              }}
            />
          </Sider>
          <Layout className="admin-main">
            <AdminHeader />
            <Content className="admin-content">
              {children}
            </Content>
          </Layout>
          <FloatButton.Group shape="circle">
            <FloatButton
              tooltip={<div>跳转到博客</div>}
              onClick={() => {
                window.location.href = import.meta.env.VITE_BLOG_URL
              }}
            />
            <FloatButton.BackTop visibilityHeight={0} />
          </FloatButton.Group>
        </Layout>
      </ConfigProvider>
    </>
  )
}
