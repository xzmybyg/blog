import adminroutes from '@/router/adminroutes'
import { Alert, ConfigProvider, FloatButton, Layout, Menu } from 'antd'
import './index.scss'
import useUserStore from '@/store/user'
import { canEditAdmin } from '@/utils/adminPermission'

const { Content, Sider } = Layout

import AdminHeader from '@/Layout/admin/Header'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const role = useUserStore((state) => state.role)
  const readOnly = !canEditAdmin(role)
  const menuItems = adminroutes.map((item) => {
    if (item.meta?.showOnMenu === false) return null
    return {
      key: item.path,
      icon: <i className={`iconfont ${item?.icon}`}></i>,
      label: item.name,
      children: item?.children?.map((child) => {
        if (child.meta?.showOnMenu === false) return null
        if (readOnly && child.meta?.editOnly) return null
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
            colorPrimary: '#1d1c1b',
            colorInfo: '#9b7854',
            colorSuccess: '#387451',
            colorError: '#b44039',
            colorText: '#1f1e1c',
            colorTextSecondary: '#756f68',
            colorBorder: '#e5dfd7',
            colorBgLayout: '#faf9f7',
            borderRadius: 12,
            fontFamily: "'Microsoft YaHei', 'PingFang SC', system-ui, sans-serif",
          },
          components: {
            Layout: {
              siderBg: '#f6f4f0',
              triggerBg: '#f6f4f0',
            },
            Menu: {
              itemBg: 'transparent',
              subMenuItemBg: 'transparent',
              itemColor: '#625d56',
              itemHoverBg: '#eeebe6',
              itemHoverColor: '#1f1e1c',
              itemSelectedBg: '#fff',
              itemSelectedColor: '#1f1e1c',
              itemBorderRadius: 12,
            },
            Pagination: {
              itemBg: '#fff',
              itemLinkBg: '#fff',
              itemActiveBg: '#fff',
              itemActiveColor: '#1d1c1b',
            },
          },
        }}
      >
        <Layout className="admin-shell">
          <Sider
            className="admin-sider"
            width={252}
            breakpoint="md"
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
          >
            <div className="admin-brand" aria-label="博客管理后台">
              <span className="admin-brand__mark">&lt;/&gt;</span>
              {!collapsed && (
                <span className="admin-brand__copy">
                  <strong>博客管理</strong>
                  <small>BLOG CONTENT STUDIO</small>
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="admin-menu-heading" aria-hidden="true">
                <span>工作区</span>
                <small>管理导航</small>
              </div>
            )}
            <Menu
              className="admin-menu"
              theme="light"
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
              {readOnly && (
                <Alert
                  className="admin-readonly-alert"
                  type="info"
                  showIcon
                  message="只读浏览模式"
                  description="当前账号可以查看后台数据，但不能新增、编辑、删除或执行运维操作。"
                />
              )}
              {children}
            </Content>
          </Layout>
          <FloatButton.Group shape="circle">
            <FloatButton
              tooltip={<div>跳转到博客</div>}
              href={import.meta.env.VITE_BLOG_URL || '/'}
            />
            <FloatButton.BackTop visibilityHeight={0} />
          </FloatButton.Group>
        </Layout>
      </ConfigProvider>
    </>
  )
}
