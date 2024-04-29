import { useState, Suspense } from "react";
import "./App.scss";
import routerList from "@/utils/router";
import { Breadcrumb, Layout, Menu, theme } from "antd";

const { Header, Content, Footer, Sider } = Layout;

import Loading from "@/pages/Loading";

function App() {
  const navigate = useNavigate();
  const router = useLocation();
  const menuItems = routerList.map((item) => {
    if (item.meta?.showOnMenu === false) return null;
    return {
      key: item.path,
      icon: item.icon,
      label: item.name,
    };
  });
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const breadcrumbItem = [
    { title: routerList.find((item) => item.path === router.pathname)?.name },
  ];

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
            theme="dark"
            defaultSelectedKeys={["1"]}
            mode="inline"
            items={menuItems}
            onClick={(item) => {
              navigate(item.key);
            }}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              background: colorBgContainer,
              padding: "5px",
              borderRadius: borderRadiusLG,
            }}
          >
            <Breadcrumb
              style={{
                margin: "16px 0",
              }}
              items={breadcrumbItem}
            />
          </Header>
          <Content
            style={{
              margin: "0 16px",
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
  );
}

export default App;
