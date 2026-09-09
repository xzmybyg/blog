export function getAboutContent() {
  return axiosInstance.get<string>('/about', { responseType: 'text' })
}

export function updateAboutContent(content: string) {
  return axiosInstance.put('/about', { content })
}
