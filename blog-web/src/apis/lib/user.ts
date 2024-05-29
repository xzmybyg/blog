export function login({ username, password }: loginParams) {
  return axiosInstance.get("/users", {
    params: {
      username,
      password,
    },
  });
}

export function register({ username, password, email }: registerParams) {
  return axiosInstance.post("/users", {
    params: {
      username,
      password,
      email,
    },
  });
}

/*-----管理系统接口-----*/

//获取用户列表
export function getUserList() {
  return axiosInstance.get("/users/usersList");
}

//删除用户
export function deleteUser(id: number) {
  return axiosInstance.delete("/users", {
    params: {
      id,
    },
  });
}

//编辑用户
export function updateUser(data) {
  return axiosInstance.put("/users", data);
}