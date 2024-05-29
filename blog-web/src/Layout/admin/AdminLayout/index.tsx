import adminroutes from '@/router/adminroutes'
import { ConfigProvider, FloatButton, Layout, Menu } from 'antd'

const { Content, Sider } = Layout

import AdminHeader from '@/Layout/admin/Header'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
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
            colorPrimary: '#aaa8fb',
          },
          components: {
            Layout: {
              siderBg: '#aaa8fb',
              triggerBg: '#aaa8fb',
            },
            Menu: {
              itemBg: '#aaa8fb',
              itemColor: '#fff',
              itemSelectedColor: '#000',
            },
          },
        }}
      >
        <Layout
          style={{
            minHeight: '100vh',
          }}
        >
          <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <Menu
              selectedKeys={[location.pathname]}
              mode="inline"
              items={menuItems}
              openKeys={openKeys(menuItems)}
              onClick={(item) => {
                navigate(item.key)
              }}
            />
          </Sider>
          <Layout>
            <AdminHeader />
            <Content
              style={{
                margin: '5px 16px',
              }}
            >
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
