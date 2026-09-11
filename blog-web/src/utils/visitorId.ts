const VISITOR_ID_KEY = 'blog-visitor-id'

export function getVisitorId() {
  try {
    const storedVisitorId = localStorage.getItem(VISITOR_ID_KEY)
    if (storedVisitorId) return storedVisitorId

    const visitorId = crypto.randomUUID()
    localStorage.setItem(VISITOR_ID_KEY, visitorId)
    return visitorId
  } catch {
    return undefined
  }
}
