// import { Suspense } from "react";

//api引入
// import { getInfo } from "@/apis";
//样式引入
import './App.scss'
// import { routerList } from "@/utils";
import RouterView from '@/router'
import { recordPageView } from '@/apis'
import { getVisitorId } from '@/utils/visitorId'

function PageViewTracker() {
  const location = useLocation()

  useEffect(() => {
    if (!location.pathname.startsWith('/admin')) {
      recordPageView(getVisitorId())
        .then(() => window.dispatchEvent(new Event('site-statistics-updated')))
        .catch(() => undefined)
    }
  }, [location.pathname, location.search])

  return null
}

function App() {
  return (
    <>
      <PageViewTracker />
      {/* <div className="layout">
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
      </div> */}
      <RouterView />
    </>
  )
}

export default App
