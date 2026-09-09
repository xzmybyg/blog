export const ADMIN_LOGIN_PATH = '/admin/login'

const decodeJwtPayload = (token: string): { exp?: number } => {
  const payload = token.replace(/^Bearer\s+/i, '').split('.')[1]
  if (!payload) throw new Error('Invalid JWT')

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return JSON.parse(atob(padded))
}

export const isTokenExpired = (token: string, now = Date.now()) => {
  try {
    const { exp } = decodeJwtPayload(token)
    return typeof exp !== 'number' || exp * 1000 <= now
  } catch {
    return true
  }
}

export const getAdminLoginUrl = (currentPath: string) => {
  const params = new URLSearchParams({ reason: 'expired' })
  if (currentPath.startsWith('/admin') && currentPath !== ADMIN_LOGIN_PATH) {
    params.set('redirect', currentPath)
  }
  return `${ADMIN_LOGIN_PATH}?${params.toString()}`
}

export const getSafeAdminRedirect = (redirect: string | null) => {
  if (!redirect?.startsWith('/admin') || redirect.startsWith(ADMIN_LOGIN_PATH)) {
    return '/admin'
  }
  return redirect
}
