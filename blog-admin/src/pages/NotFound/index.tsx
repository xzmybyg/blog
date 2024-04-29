import "./index.scss";

export default function NotFound() {
  const navigate = useNavigate();
  const onGoHome = () => {
    navigate("/");
  };
  return (
    <div className="error layout-padding">
      {/* <div className="layout-padding-auto layout-padding-view"> */}
        <div className="error-flex">
          <div className="left">
            <div className="left-item">
              <div className="left-item-animation left-item-num">404</div>
              <div className="left-item-animation left-item-title">
                地址输入错误，请重新输入地址
              </div>
              <div className="left-item-animation left-item-msg">
                您可以先检查网址，然后重新输入或给我们反馈问题。
              </div>
              <div className="left-item-animation left-item-btn">
                <Button type="primary" onClick={onGoHome}>
                  返回首页
                </Button>
              </div>
            </div>
          </div>
          <div className="right">
            <img src="https://i.hd-r.cn/1a0d90a6c1e8b0184c7299dda713effd.png" />
          </div>
        </div>
      {/* </div> */}
    </div>
  );
}
