import { Suspense } from "react";
//第三方库
import { Layout, FloatButton } from "antd";

import useStore from "@/store";
//api引入
import { getInfo, login } from "@/apis";
//type引入
import type { RouterType } from "@/types";
//样式引入
import "./App.scss";
import {routerList} from "@/utils";
const { Header, Content, Footer } = Layout;

function App() {
  const contentRef = useRef(null);

  const { setTotal, setUser } = useStore();
  const userInfo = { username: "1277215827", password: "lcyzs" };

  useEffect(() => {
    getInfo().then(res => {
      setTotal(res.data[0].total_rows);
    });
  }, []);

  useEffect(() => {
    login(userInfo).then(res => {
      setUser(res.data.token);
      localStorage.setItem("token", res.data.token);
    });
  }, []);

  return (
    <>
      <div className="layout" ref={contentRef}>
        {/* <Header className="blog-header"> */}
        <Nav navlist={routerList}></Nav>
        {/* </Header> */}
        <Content className="blog-content">
          <Suspense fallback={<div>Loading...</div>}>
            {/* {useRoutes(routes)} */}
            <Routes>
              {routerList.map((item: RouterType) => (
                <Route
                  key={item.name}
                  path={item.path}
                  element={item.element}
                ></Route>
              ))}
            </Routes>
          </Suspense>
          <FloatButton.BackTop target={() => contentRef?.current || document} />
        </Content>
        <Footer
          className="blog-footer"
          style={{
            width: "100vw",
            textAlign: "center",
          }}
        >
          ©2023 Created By 心中没有白月光
        </Footer>
      </div>
    </>
  );
}

export default App;
