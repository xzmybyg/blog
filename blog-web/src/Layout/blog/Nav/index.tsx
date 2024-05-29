import {
  UnorderedListOutlined,
} from "@ant-design/icons"
import Style from "./index.module.scss"
import Login from "@/components/Login"
import useUserStore, { logoutInfo } from "@/store/user"
import { Avatar, Popover } from "antd"
import routes from "@/router/routes"

function Nav({ navlist = routes }) {
  const { navDesktop, navMobile, itemWrap, navItem, authorName, MobileMenu } =
    Style
  const { id, username, nickname, avatar } = useUserStore()
  const [MobileMenuVisible, setMobileMenuVisible] = useState(false)

  const navigate = useNavigate()

  const loginRef = useRef<{ openModal: () => void } | null>(null)
  const callChildMethod = () => {
    if (loginRef.current) {
      loginRef.current?.openModal()
    }
  }

  const navbarRef = useRef<HTMLElement | null>(null)

  let lastScrollTop = 0

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    if (navbarRef.current) {
      if (scrollTop > lastScrollTop) {
        // 向下滚动
        navbarRef.current.style.opacity = "0"
      } else {
        // 向上滚动
        navbarRef.current.style.opacity = "1"
        navbarRef.current.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
      }
    }
    lastScrollTop = scrollTop
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <>
      <nav className={navDesktop} ref={navbarRef}>
        <div className={authorName}>心中没有白月光</div>
        <div className={itemWrap}>
          {navlist.map(item => {
            return (
              item.showOnNav != false && (
                <div
                  className={navItem}
                  key={item.name}
                  onClick={() => {
                    navigate(item.path)
                  }}
                >
                  <i className={`iconfont ${item.icon}`}></i>
                  {item.name}
                </div>
              )
            )
          })}
          {id ? (
            <div className={navItem}>
              <Popover
                placement="bottomRight"
                content={<div onClick={logoutInfo}>退出</div>}
              >
                <Avatar src={avatar} icon={avatar ? null : <i className="iconfont icon-denglu1" />} />
                <span>{nickname || username}</span>
              </Popover>
            </div>
          ) : (
            <div className={navItem} onClick={callChildMethod}>
              <i className="iconfont icon-zhucedenglu" />
              登录
            </div>
          )}
        </div>
      </nav>
      <nav className={navMobile}>
        <div className={authorName}>心中没有白月光</div>
        <UnorderedListOutlined
          onClick={() => setMobileMenuVisible(!MobileMenuVisible)}
        />
        {MobileMenuVisible && (
          <div className={MobileMenu}>
            {avatar ? (
              <div>
                <Avatar src={avatar} />
                <span>{nickname || username}</span>
              </div>
            ) : (
              <div className={navItem} onClick={callChildMethod}>
                <i className="iconfont icon-zhucedenglu" />
                登录
              </div>
            )}
            {navlist.map(item => {
              return (
                item.showOnNav != false && (
                  <div
                    className={navItem}
                    key={item.name}
                    onClick={() => {
                      navigate(item.path)
                    }}
                  >
                    <i className={`iconfont ${item.icon}`}></i>
                    {item.name}
                  </div>
                )
              )
            })}
            {id && (
              <div className={navItem} onClick={logoutInfo}>
                退出
              </div>
            )}
          </div>
        )}
      </nav>
      <Login ref={loginRef} />
    </>
  )
}

export default Nav
