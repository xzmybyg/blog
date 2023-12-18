import { axiosInstance } from "@/utils";

export function getInfo() {
  return axiosInstance.get("/api/");
}
