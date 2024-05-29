/* 创建withRouter */
export const withRouter = function withRouter(Component) {
  //Component:真实要渲染的组件
  return function HOC() {
    const navigate = useNavigate(),
      location = useLocation(),
      params = useParams(),
      [usp] = useSearchParams()

    return <Component navigate={navigate} location={location} params={params} usp={usp} />
  }
}
