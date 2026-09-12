const configuredBase = import.meta.env.VITE_BASE_URL
const baseURL = configuredBase && configuredBase !== './' ? configuredBase.replace(/\/$/, '') : ''

export const DEFAULT_USER_AVATAR = `${baseURL}/blog-icon.jpg`
