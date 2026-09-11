export type SiteNotice = {
  content: string
}

export const DEFAULT_SITE_NOTICE: SiteNotice = {
  content: '这里记录前端工程、产品体验与持续学习中的真实解法。',
}

export function getSiteNotice() {
  return axiosInstance.get<SiteNotice>('/site-notice')
}

export function updateSiteNotice(notice: SiteNotice) {
  return axiosInstance.put<SiteNotice>('/site-notice', notice)
}
