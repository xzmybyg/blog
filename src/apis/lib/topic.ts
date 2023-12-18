import { axiosInstance } from "@/utils";

export function getTopic(id: string) {
  return axiosInstance.get("/api/topic/", {
    params: {
      id,
    },
  });
}
