import React from "react";
import useStore from "@/store";

type PrivateRouteProps = {
  component: React.FC;
};

function isAuthenticated() {
  // 这里应该是你的实际检查逻辑
  const { token: tk } = useStore();
  let token = tk || localStorage.getItem("token");
  return token !== null;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  return isAuthenticated() ? (
    <Component {...rest} />
  ) : (
    ((<div>请登录</div>) as React.ReactElement)
  );
};

export default PrivateRoute;
