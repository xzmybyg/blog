import adminroutes from '@/router/adminroutes'
import { Alert, ConfigProvider, FloatButton, Layout, Menu, theme as antTheme } from 'antd'
import './index.scss'
import useUserStore from '@/store/user'
import useThemeStore from '@/store/theme'
import { canEditAdmin } from '@/utils/adminPermission'

const { Content, Sider } = Layout

import AdminHeader from '@/Layout/admin/Header'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const role = useUserStore((state) => state.role)
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'
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
          algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: {
            colorPrimary: isDark ? '#c8a47a' : '#1d1c1b',
            colorInfo: isDark ? '#c8a47a' : '#9b7854',
            colorSuccess: '#387451',
            colorError: '#b44039',
            colorText: isDark ? '#eee9e1' : '#1f1e1c',
            colorTextSecondary: isDark ? '#b9afa4' : '#756f68',
            colorBorder: isDark ? '#46443f' : '#e5dfd7',
            colorBgLayout: isDark ? '#1b1d1e' : '#faf9f7',
            colorBgContainer: isDark ? '#252728' : '#fff',
            borderRadius: 12,
            fontFamily: "'Microsoft YaHei', 'PingFang SC', system-ui, sans-serif",
          },
          components: {
            Layout: {
              siderBg: isDark ? '#222425' : '#f6f4f0',
              triggerBg: isDark ? '#222425' : '#f6f4f0',
            },
            Menu: {
              itemBg: 'transparent',
              subMenuItemBg: 'transparent',
              itemColor: isDark ? '#b9afa4' : '#625d56',
              itemHoverBg: isDark ? '#303130' : '#eeebe6',
              itemHoverColor: isDark ? '#eee9e1' : '#1f1e1c',
              itemSelectedBg: isDark ? '#343432' : '#fff',
              itemSelectedColor: isDark ? '#eee9e1' : '#1f1e1c',
              itemBorderRadius: 12,
            },
            Pagination: {
              itemBg: isDark ? '#252728' : '#fff',
              itemLinkBg: isDark ? '#252728' : '#fff',
              itemActiveBg: isDark ? '#343432' : '#fff',
              itemActiveColor: isDark ? '#c8a47a' : '#1d1c1b',
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
              theme={theme}
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
