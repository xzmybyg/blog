import routes from "./routes"
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom"
//路由懒加载 需要Suspense组件配合才能实现
import { Suspense } from "react"
import AdminLayout from "@/components/Layout"

import useUserStore from "@/store/user"

/* 统一渲染的组件：在这里可以做一些事情，「例如权限/登录态校验，传递路由信息的属性...」 */
const Element = function Element(props) {
  const { component: Component } = props
  const { token } = useUserStore()

  //特殊事情： 把路由信息先获取到，最后基于属性传递给组件「这样只要是基于<Route>匹配渲染的组件「不管是类组件还是函数组件」都可以基于属性获取到路由信息」
  const navigate = useNavigate(),
    location = useLocation(),
    params = useParams(),
    [usp] = useSearchParams()

  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate("/login")
    } else {
      setHasCheckedAuth(true)
    }
  }, [token])

  if (!hasCheckedAuth && props.name !== "登录") {
    return <Loading />
  }

  //最后要把Component进行渲染
  return (
    <>
      {props.name === "登录" || props.meta.level > 1 ? (
        <Component
          navigate={navigate}
          location={location}
          params={params}
          usp={usp}
        />
      ) : (
        <AdminLayout>
          <Component
            navigate={navigate}
            location={location}
            params={params}
            usp={usp}
          />
        </AdminLayout>
      )}
    </>
  )
}

/* 递归创建Route */
const createRoute = function createRoute(routes) {
  //每一次路由匹配成功，不直接渲染我们设定的组件，而是渲染Element；在Element做一些特殊处理后，再去渲染我们真实要渲染的组件！！
  return (
    <>
      {routes.map((item, index) => {
        const { path, children } = item
        return (
          <Route key={index} path={path} element={<Element {...item} />}>
            {/* 基于递归的方式，绑定子集路由 */}
            {Array.isArray(children) ? createRoute(children) : null}
          </Route>
        )
      })}
    </>
  )
}

/* 创建路由容器 */
export default function RouterView() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>{createRoute(routes)}</Routes>
    </Suspense>
  )
}

/* 路由表配置完成后
函数组件 & 基于Route匹配渲染的，可以基于props获取路由信息，也可以自己使用Hook函数获取 
类组件 & 基于Route匹配渲染的，只能基于属性获取，或者使用withRouter「自己写的」
函数组件 & 不是Route匹配的：可以基于Hook自己处理，也可以使用withRoute
类组件 & 不是Route匹配的：只能使用withRouter
------
都要放在<HashRouter>内部
*/
