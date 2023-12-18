import { axiosInstance } from "@/utils";

type loginParams = {
  username: string;
  password: string;
};

export function login({ username, password }: loginParams) {
  return axiosInstance.get("/api/login/", {
    params: {
      username,
      password,
    },
  });
}
