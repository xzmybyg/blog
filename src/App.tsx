import { Suspense } from "react";
//第三方库
import { Layout } from "antd";
// import routes from "~react-pages";

import useStore from "@/store";
//api引入
import { getInfo } from "@/apis";
//type引入
import type { RouterType } from "@/types";
//样式引入
import "./App.scss";

const { Header, Content, Footer } = Layout;

function App() {
  const { setTotal, setArticleList, articleList } = useStore();

  useEffect(() => {
    getInfo().then(res => {
      setTotal(res.data[0].total_rows);
    });
  }, []);

  return (
    <>
      <div className="layout">
        <Header className="blog-header">
          <Nav></Nav>
        </Header>
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
