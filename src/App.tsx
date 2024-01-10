import { Suspense } from "react";

import useStore from "@/store";
//api引入
import { getInfo, login } from "@/apis";
//type引入
import type { RouterType } from "@/types";
//样式引入
import "./App.scss";
import { routerList } from "@/utils";

function App() {
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
      <div className="layout">
        <Suspense fallback={<Loading />}>
          <Routes>
            {routerList.map((item: RouterType) =>
              item.name !== "管理" ? (
                <Route
                  key={item.name}
                  path={item.path}
                  element={<MyLayout>{item.element}</MyLayout>}
                ></Route>
              ) : (
                <Route key={item.name} path={item.path} element={item.element}>
                  {item.children?.map(child => (
                    <Route
                      key={child.path}
                      path={child.path}
                      element={child.element}
                    />
                  ))}
                </Route>
              )
            )}
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default App;
