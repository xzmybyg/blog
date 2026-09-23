export const bundledArticleCover = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}banner.webp`

export function getDefaultArticleCover(version?: string | number) {
  const suffix = version === undefined ? '' : `?v=${encodeURIComponent(version)}`
  return `/api/site-background/article${suffix}`
}

export function resolveArticleCover(banner?: string, defaultVersion?: string | number) {
  const value = banner?.trim()
  if (!value || value === '404') return getDefaultArticleCover(defaultVersion)
  if (/^(https?:)?\/\//.test(value) || value.startsWith('/') || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }
  return `https://filespace.xzmybyg.cn/images/${value}?imageMogr2/thumbnail/960x/format/webp/quality/78`
}
