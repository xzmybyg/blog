export type RateLimitSource = 'default' | 'environment' | 'database'

export type RateLimitRule = {
  key: string
  label: string
  description: string
  max: number
  windowMs: number
  source: RateLimitSource
  version: number
}

export function getRateLimitConfig() {
  return axiosInstance.get<RateLimitRule[]>('/rate-limit-config')
}

export function updateRateLimitConfig(key: string, rule: Pick<RateLimitRule, 'max' | 'windowMs'>) {
  return axiosInstance.put<RateLimitRule>(`/rate-limit-config/${key}`, rule)
}

export function resetRateLimitConfig(key: string) {
  return axiosInstance.delete<RateLimitRule>(`/rate-limit-config/${key}`)
}
