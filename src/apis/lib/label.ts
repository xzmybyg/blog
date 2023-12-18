import { axiosInstance } from "@/utils";

export function getLabelList() {
  return axiosInstance.get("/api/label");
}
