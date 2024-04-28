import { Suspense } from "react";

import useStore from "@/store";
//api引入
// import { getInfo } from "@/apis";
//样式引入
import "./App.scss";
import { routerList } from "@/utils";

function App() {
  const { setTotal } = useStore();

  useEffect(() => {
    getInfo().then(res => {
      setTotal(res.data[0].total_rows);
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
