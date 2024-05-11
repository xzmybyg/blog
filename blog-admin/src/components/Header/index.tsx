import useUserStore from "@/store/user"
import "./index.scss"
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

  const getBreadcrumbItems = (currentPath: string): { title: string }[] => {
    const pathnames = currentPath.split("/").filter((x) => x)

    const breadcrumbItems: { title: string }[] = []
    let list = routes

    for (let i = 0; i < pathnames.length; i++) {
      const routePath = "/" + pathnames.slice(0, i + 1).join("/")
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
        items={getBreadcrumbItems(router.pathname)}
      />
      {id ? (
        <div>
          <Popover
            placement="bottomRight"
            content={<div onClick={logoutInfo}>退出</div>}
          >
            <Avatar
              src={avatar}
              icon={avatar ? null : <i className="iconfont icon-tuichu" />}
            />
            <span>{nickname || username}</span>
          </Popover>
        </div>
      ) : (
        <div
          onClick={() => {
            navigate("/login")
          }}
        >
          <i className="iconfont icon-denglu1" />
          登录
        </div>
      )}
    </Header>
  )
}
