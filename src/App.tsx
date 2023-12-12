import { Suspense } from "react";
import { Layout } from "antd";
import Router from "@/@types/Router";
import "./App.scss";
import useStore from "@/store";

const { Header, Content, Footer } = Layout;

function App() {
  const { setTotal, setArticleList, articleList } = useStore();

  useEffect(() => {
    axios.get("/api").then(res => {
      setTotal(res.data[0].total_rows);
    });
    axios.get("/api/article/").then(res => {
      setArticleList(res.data);
      console.log(articleList, "articleList");
    });
  }, []);

  return (
    <>
      <Layout className="layout">
        <Header className="blog-header">
          <Nav></Nav>
        </Header>
        <Content className="blog-content">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {router.map((item: Router) => (
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
      </Layout>
    </>
  );
}

export default App;
