export type ArticleCoverInfo = {
  name: string
  url: string
  size: number
  updatedAt: string
}

export function getArticleCoverList() {
  return axiosInstance.get<ArticleCoverInfo[]>('/article-cover')
}

export function uploadArticleCover(file: File) {
  return axiosInstance.post<ArticleCoverInfo>('/article-cover', file, {
    headers: { 'Content-Type': file.type },
    timeout: 30000,
  })
}

export function replaceArticleCover(fileName: string, file: File) {
  return axiosInstance.put<ArticleCoverInfo>(`/article-cover/${encodeURIComponent(fileName)}`, file, {
    headers: { 'Content-Type': file.type },
    timeout: 30000,
  })
}
