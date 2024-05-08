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

export function getUserList() {
  return axiosInstance.get("/users/usersList");
}

export function deleteUser(id: number) {
  return axiosInstance.delete("/users", {
    params: {
      id,
    },
  });
}

export function updateUser(data) {
  return axiosInstance.put("/users", data);
}
