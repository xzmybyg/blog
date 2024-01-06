import { loginParams, registerParams } from "@/types";

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
