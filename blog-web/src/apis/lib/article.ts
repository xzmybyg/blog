// /**
//  * 获取分页文章列表
//  * @param {Object} options - 选项参数
//  * @param {number} options.page - 当前页码，默认为1
//  * @param {number} options.pageSize - 每页显示数量，默认为5
//  * @returns {Promise} - 返回一个 Promise 对象，包含文章列表数据
//  */

export function getPageArticleList({ page = 1, pageSize = 5 }) {
  return axiosInstance.get('/article/', {
    params: {
      page,
      pageSize,
    },
  })
}

/**
 * 获取所有文章列表
 * @returns Promise<AxiosResponse<any>>
 */
export function getAllArticleList() {
  return axiosInstance.get('/article/', {
    params: {
      allList: true,
    },
  })
}

/**
 * 删除文章
 * @param id 文章ID
 * @returns Promise对象，用于处理编辑文章的请求
 */
export function deleteArticle(id: number) {
  return axiosInstance.delete('/article/', {
    params: {
      id,
    },
  })
}

/**
 * 编辑文章
 * @param id 文章ID
 * @returns Promise对象，用于处理编辑文章的请求
 */
export function editArticle(id: number) {
  return axiosInstance.put('/article/', {
    params: {
      id,
    },
  })
}
/*-----管理系统接口-----*/
export function updateArticle(data) {
  return axiosInstance.put('/article', data)
}

//上传文章文件
export function uploadArticleFile(data) {
  return axiosInstance.post('/article/upload', data)
}

//获取文章文件
export function getArticleFiles() {
  return axiosInstance.get('/article/articles')
}

//上传文章到七牛云
export function UploadArticleQiniu(data) {
  return axiosInstance.post('/qiniu', data)
}
