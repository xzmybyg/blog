
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
