import { LoginOutlined, UnorderedListOutlined } from "@ant-design/icons";
import type { RouterType } from "@/types";
import Style from "./index.module.scss";
import Login from "@/components/Login";

function Nav(_prpos: { navlist: RouterType[] }) {
  const { navDesktop, navMobile, itemWrap, navItem, authorName } = Style;

  const navigate = useNavigate();

  const loginRef = useRef<{ openModal: () => void } | null>(null);
  const callChildMethod = () => {
    if (loginRef.current) {
      loginRef.current?.openModal();
    }
  };

  return (
    <>
      <nav className={navDesktop}>
        <div className={authorName}>心中没有白月光</div>
        <div className={itemWrap}>
          {routerList.map(item => {
            return (
              item.showOnNav != false && (
                <div
                  className={navItem}
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                  }}
                >
                  <i>{item.icon}</i>
                  {item.name}
                </div>
              )
            );
          })}
          <div className={navItem} onClick={callChildMethod}>
            <LoginOutlined />
            登录
          </div>
        </div>
      </nav>
      <nav className={navMobile}>
        <div className={authorName}>心中没有白月光</div>
        <UnorderedListOutlined />
      </nav>
      <Login ref={loginRef} />
    </>
  );
}

export default Nav;
