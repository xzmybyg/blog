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
