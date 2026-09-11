export function getSiteStatistics() {
  return axiosInstance.get<{ pageViews: number; uniqueVisitors: number }>('/site-statistics')
}

export function recordPageView(visitorId?: string) {
  return axiosInstance.post('/site-statistics/view', { visitorId })
}
