import { describe, expect, it } from 'vitest'
import { getAdminLoginUrl, getSafeAdminRedirect, isTokenExpired } from './auth'

const createToken = (payload: object) => {
  const encoded = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `header.${encoded}.signature`
}

describe('auth', () => {
  it('detects valid, expired and malformed tokens', () => {
    const now = 1_700_000_000_000
    expect(isTokenExpired(createToken({ exp: now / 1000 + 60 }), now)).toBe(false)
    expect(isTokenExpired(createToken({ exp: now / 1000 - 1 }), now)).toBe(true)
    expect(isTokenExpired('invalid-token', now)).toBe(true)
  })

  it('keeps only safe admin redirects', () => {
    expect(getSafeAdminRedirect('/admin/article')).toBe('/admin/article')
    expect(getSafeAdminRedirect('/admin/login?redirect=/admin')).toBe('/admin')
    expect(getSafeAdminRedirect('https://example.com')).toBe('/admin')
    expect(getSafeAdminRedirect(null)).toBe('/admin')
  })

  it('adds the current admin path to the expired-session login URL', () => {
    expect(getAdminLoginUrl('/admin/article')).toBe('/admin/login?reason=expired&redirect=%2Fadmin%2Farticle')
    expect(getAdminLoginUrl('/article')).toBe('/admin/login?reason=expired')
  })
})
