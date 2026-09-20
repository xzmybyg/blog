import { MenuOutlined, CloseOutlined } from '@ant-design/icons'
import { NavLink } from 'react-router-dom'
import Style from './index.module.scss'
import Login from '@/components/Login'
import useUserStore, { logoutInfo } from '@/store/user'
import { Avatar, Popover } from 'antd'
import routes from '@/router/routes'
import { DEFAULT_USER_AVATAR } from '@/utils/avatar'

function Nav({ navlist = routes }) {
  const { navDesktop, navMobile, itemWrap, navItem, authorName, MobileMenu } = Style
  const { id, username, nickname, avatar } = useUserStore()
  const [MobileMenuVisible, setMobileMenuVisible] = useState(false)

  const loginRef = useRef<{ openModal: () => void } | null>(null)
  const callChildMethod = () => {
    if (loginRef.current) {
      loginRef.current?.openModal()
    }
  }

  const navbarRef = useRef<HTMLElement | null>(null)

  return (
    <>
      <nav className={navDesktop} ref={navbarRef}>
        <NavLink className={authorName} to="/" aria-label="心中没有白月光博客首页">
          <span aria-hidden="true">&lt;/&gt;</span> 心中没有白月光
        </NavLink>
        <div className={itemWrap}>
          {navlist.map((item) => {
            return (
              item.showOnNav != false && (
                <NavLink
                  className={({ isActive }) => `${navItem} ${isActive ? Style.active : ''}`}
                  key={item.name}
                  to={item.path}
                >
                  <i className={`iconfont ${item.icon}`} aria-hidden="true"></i>
                  {item.name}
                </NavLink>
              )
            )
          })}
          {id ? (
            <div className={navItem}>
              <Popover placement="bottomRight" content={<button type="button" className={Style.popoverAction} onClick={logoutInfo}>退出登录</button>}>
                <Avatar src={avatar || DEFAULT_USER_AVATAR} />
                <span>{nickname || username}</span>
              </Popover>
            </div>
          ) : (
            <button type="button" className={navItem} onClick={callChildMethod}>
              <i className="iconfont icon-zhucedenglu" />
              登录
            </button>
          )}
        </div>
      </nav>
      <nav className={navMobile}>
        <NavLink className={authorName} to="/">
          <span aria-hidden="true">&lt;/&gt;</span> 心中没有白月光
        </NavLink>
        <button
          type="button"
          className={Style.menuButton}
          aria-label={MobileMenuVisible ? '关闭导航菜单' : '打开导航菜单'}
          aria-expanded={MobileMenuVisible}
          aria-controls="mobile-navigation"
          onClick={() => setMobileMenuVisible(!MobileMenuVisible)}
        >
          {MobileMenuVisible ? <CloseOutlined /> : <MenuOutlined />}
        </button>
        {MobileMenuVisible && (
          <div id="mobile-navigation" className={MobileMenu}>
            {id ? (
              <div>
                <Avatar src={avatar || DEFAULT_USER_AVATAR} />
                <span>{nickname || username}</span>
              </div>
            ) : (
              <button type="button" className={navItem} onClick={callChildMethod}>
                <i className="iconfont icon-zhucedenglu" />
                登录
              </button>
            )}
            {navlist.map((item) => {
              return (
                item.showOnNav != false && (
                  <NavLink
                    className={({ isActive }) => `${navItem} ${isActive ? Style.active : ''}`}
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuVisible(false)}
                  >
                    <i className={`iconfont ${item.icon}`}></i>
                    {item.name}
                  </NavLink>
                )
              )
            })}
            {id && (
              <button type="button" className={navItem} onClick={logoutInfo}>
                退出
              </button>
            )}
          </div>
        )}
      </nav>
      <Login ref={loginRef} />
    </>
  )
}

export default Nav
