export const canAccessAdmin = (role: string) => role === 'admin' || role === 'viewer'

export const canEditAdmin = (role: string) => role === 'admin'
