
// 获取文章列表
export function getPageArticleList({ page = 1, pageSize = 5 }={}) {
  return axiosInstance.get("/article/", {
    params: {
      page,
      pageSize,
    },
  });
}

export function getAllArticleList() {
  return axiosInstance.get("/article", {
    params: {
      allList: true,
    },
  });
}

export function addArticle(data) {
  return axiosInstance.post("/article", data);
}

export function deleteArticle(id) {
  return axiosInstance.delete("/article", {
    params: {
      id,
    },
  });
}

export function updateArticle(data) {
  return axiosInstance.put("/article", data);
}

