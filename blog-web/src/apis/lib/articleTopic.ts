export function getArticleTopicList() {
  return axiosInstance.get('/article-topic')
}

export function addArticleTopic(data: Pick<ArticleTopic, 'name' | 'description'>) {
  return axiosInstance.post('/article-topic', data)
}

export function updateArticleTopic(data: Pick<ArticleTopic, 'id' | 'name' | 'description'>) {
  return axiosInstance.put('/article-topic', data)
}

export function deleteArticleTopic(id: number) {
  return axiosInstance.delete('/article-topic', { params: { id } })
}

export function reorderArticleTopic(id: number, articleIds: number[]) {
  return axiosInstance.put(`/article-topic/${id}/order`, { articleIds })
}
