import { Suspense } from "react"
import "./App.scss"
import routerList from "@/utils/router"
import { Layout, Menu } from "antd"

const { Content, Sider } = Layout

import Loading from "@/pages/Loading"

import AdminHeader from "./components/Header"

function App() {
  const navigate = useNavigate()
  const menuItems = routerList.map((item) => {
    if (item.meta?.showOnMenu === false) return null
    return {
      key: item.path,
      icon: item.icon,
      label: item.name,
      children:item?.children?.map((child) => {
        if (child.meta?.showOnMenu === false) return null
        return {
          key: child.path,
          icon: child.icon,
          label: child.name,
        }
      })
    }
  })
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <Layout
        style={{
          minHeight: "100vh",
        }}
      >
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <Menu
            defaultSelectedKeys={["1"]}
            mode="inline"
            items={menuItems}
            onClick={(item) => {
              navigate(item.key)
            }}
          />
        </Sider>
        <Layout>
          <AdminHeader />
          <Content
            style={{
              margin: "5px 16px",
            }}
          >
            <Suspense fallback={<Loading />}>
              <Routes>
                {routerList.map((item) => (
                  <Route
                    key={item.path}
                    path={item.path}
                    element={item.element}
                  ></Route>
                ))}
              </Routes>
            </Suspense>
          </Content>
        </Layout>
      </Layout>
    </>
  )
}

export default App
