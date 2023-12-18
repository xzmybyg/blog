import { axiosInstance } from "@/utils";

export function getComment(id: number) {
  return axiosInstance.get("/api/comment", {
    params: {
      id,
    },
  });
}
