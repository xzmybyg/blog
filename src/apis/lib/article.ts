import { axiosInstance } from "@/utils";

// 获取文章列表
export function getPageArticleList({ page = 1, pageSize = 5 }) {
  return axiosInstance.get("/api/article/", {
    params: {
      page,
      pageSize,
    },
  });
}

export function getAllArticleList(id: string) {
  return axiosInstance.get("/api/topic/", {
    params: {
      id,
    },
  });
}
