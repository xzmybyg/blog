import { Outlet } from "react-router-dom";
import { Breadcrumb, Layout, Menu, theme } from "antd";
const { Header, Content, Sider } = Layout;
import type { MenuProps } from "antd";
type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  children?: MenuItem[],
  icon?: React.ReactNode
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const Item = [
  getItem("文章管理", "article", [
    getItem("文章列表", "article"),
    getItem("文章发布", "articlePublish"),
  ]),
  getItem("用户管理", "user"),
  getItem("友链管理", "link"),
  getItem("留言管理", "comment"),
  getItem("标签管理", "label"),
];

export default function Admin() {
  const menuList = routerList.filter(item => item.name === "管理")[0];
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      <Layout>
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
            items={Item}
            onSelect={item => {
              console.log(item.key);
              navigate(`/admin/${item.key}`);
            }}
          />
        </Sider>
        <Layout>
          {/* <Header style={{ padding: 0 }} /> */}
          <Content style={{ margin: "0 16px" }}>
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>User</Breadcrumb.Item>
              <Breadcrumb.Item>Bill</Breadcrumb.Item>
            </Breadcrumb>
            <div
              style={{
                padding: 24,
                minHeight: 360,
              }}
            >
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
