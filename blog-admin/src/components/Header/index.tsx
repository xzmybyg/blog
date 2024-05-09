import useUserStore from "@/store/user"
import "./index.scss"
import { LoginOutlined, UserOutlined } from "@ant-design/icons"
import { Breadcrumb, Layout, Popover, theme } from "antd"
import routes from "@/router/routes"
const { Header } = Layout

export default function AdminHeader() {
  const { id, username, nickname, avatar } = useUserStore()
  const navigate = useNavigate()
  const router = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const breadcrumbItem = [
    { title: routes.find((item) => item.path === router.pathname)?.name },
  ]

  return (
    <Header
      className="header"
      style={{
        background: colorBgContainer,
        padding: "5px",
        borderRadius: borderRadiusLG,
      }}
    >
      <Breadcrumb
        style={{
          margin: "5px 10px",
        }}
        items={breadcrumbItem}
      />
      {id ? (
        <div>
          <Popover
            placement="bottomRight"
            content={<div onClick={logoutInfo}>退出</div>}
          >
            <Avatar src={avatar} icon={avatar ? null : <UserOutlined />} />
            <span>{nickname || username}</span>
          </Popover>
        </div>
      ) : (
        <div
          onClick={() => {
            navigate("/login")
          }}
        >
          <LoginOutlined />
          登录
        </div>
      )}
    </Header>
  )
}
