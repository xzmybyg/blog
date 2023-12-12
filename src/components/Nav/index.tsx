import "./index.scss";
import { LoginOutlined } from "@ant-design/icons";

function Nav() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <>
      <div className="nav-normal">
        <div>心中没有白月光</div>
        <div className="item-wrap">
          {router.map(item => {
            return (
              item.showOnNav != false && (
                <div
                  className="nav-item"
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
          <div
            className="nav-item"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            <LoginOutlined />
            登录
          </div>
        </div>
        {/* <Button className="nav-mini">
          <UnorderedListOutlined />
        </Button> */}
      </div>
    </>
  );
}

export default Nav;
