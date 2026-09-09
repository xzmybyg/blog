export type SiteBackgroundType = 'home' | 'message'

export type SiteBackgroundInfo = {
  exists: boolean
  size?: number
  updatedAt?: string
  url?: string
}

export function getSiteBackgroundInfo(type: SiteBackgroundType) {
  return axiosInstance.get<SiteBackgroundInfo>(`/site-background/${type}/info`)
}

export function uploadSiteBackground(type: SiteBackgroundType, file: File) {
  return axiosInstance.put<SiteBackgroundInfo>(`/site-background/${type}`, file, {
    headers: { 'Content-Type': file.type },
    timeout: 30000,
  })
}

export function getSiteBackgroundUrl(type: SiteBackgroundType, version?: string | number) {
  const suffix = version === undefined ? '' : `?v=${encodeURIComponent(version)}`
  return `/api/site-background/${type}${suffix}`
}
