
// 获取文章列表
export function getPageArticleList({ page = 1, pageSize = 5 }) {
  return axiosInstance.get("/article/", {
    params: {
      page,
      pageSize,
    },
  });
}

export function getAllArticleList() {
  return axiosInstance.get("/article/", {
    params: {
      allList: true,
    },
  });
}

export function delArticle(id: number) {
  return axiosInstance.delete("/article/", {
    params: {
      id,
    },
  });
}

export function editArticle(id: number) {
  return axiosInstance.put("/article/", {
    params: {
      id,
    },
  });
}
