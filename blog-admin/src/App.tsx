import { useState, Suspense } from "react";
import "./App.scss";
import routerList from "@/utils/router";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { JSX } from "react/jsx-runtime";

const { Header, Content, Footer, Sider } = Layout;
function getItem(label: string, key: string, icon: JSX.Element, children?: never[] | undefined) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem("文章管理", "1", <PieChartOutlined />),
  getItem("Topic", "2", <DesktopOutlined />),
  getItem("用户管理", "3", <UserOutlined />, [
  ]),
  getItem("友链管理", "4", <TeamOutlined />, [
  ]),
  getItem("标签管理", "5", <FileOutlined />),
];

function App() {
  const [count, setCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
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
          onCollapse={value => setCollapsed(value)}
        >
          <div className="demo-logo-vertical" />
          <Menu
            theme="dark"
            defaultSelectedKeys={["1"]}
            mode="inline"
            items={items}
          />
        </Sider>
        <Layout>
          <Content
            style={{
              margin: "0 16px",
            }}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                {routerList.map(item => (
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
