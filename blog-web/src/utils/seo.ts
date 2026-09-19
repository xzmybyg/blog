const SITE_NAME = '心中没有白月光'
const DEFAULT_DESCRIPTION = '记录 React、TypeScript、前端工程化、产品体验与个人项目实践的技术博客。'

const pageDescriptions: Record<string, string> = {
  '/': DEFAULT_DESCRIPTION,
  '/article': '浏览 React、TypeScript、工程化与产品体验相关文章。',
  '/about': '了解作者、技术方向以及这个博客的搭建过程。',
  '/link': '访问博客收录的朋友和优质技术站点。',
  '/message': '在留言板分享想法、建议或想聊的话题。',
}

function setMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value))
}

export function updateSeoMetadata(pageName: string, pathname: string) {
  const isHome = pathname === '/'
  const isAdmin = pathname.startsWith('/admin')
  const isNotFound = pageName === '404'
  const title = isHome ? `${SITE_NAME}的技术博客` : `${pageName} · ${SITE_NAME}`
  const description = pathname.startsWith('/topic/')
    ? '阅读技术文章正文、相关专题章节和评论。'
    : pageDescriptions[pathname] || DEFAULT_DESCRIPTION
  const canonicalUrl = new URL(pathname, window.location.origin).toString()

  document.title = title
  setMeta('meta[name="description"]', { name: 'description', content: description })
  setMeta('meta[name="robots"]', {
    name: 'robots',
    content: isAdmin || isNotFound ? 'noindex, nofollow' : 'index, follow',
  })
  setMeta('meta[property="og:title"]', { property: 'og:title', content: title })
  setMeta('meta[property="og:description"]', { property: 'og:description', content: description })
  setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = canonicalUrl
}
