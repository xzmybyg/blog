import { axiosInstance } from "@/utils";

export function getLinkList() {
  return axiosInstance.get("/api/link");
}
