import { describe, expect, it } from 'vitest'
import { canAccessAdmin, canEditAdmin } from './adminPermission'

describe('adminPermission', () => {
  it('allows administrators to access and edit the admin console', () => {
    expect(canAccessAdmin('admin')).toBe(true)
    expect(canEditAdmin('admin')).toBe(true)
  })

  it('allows viewers to access without edit permission', () => {
    expect(canAccessAdmin('viewer')).toBe(true)
    expect(canEditAdmin('viewer')).toBe(false)
  })

  it('rejects ordinary and unknown roles', () => {
    expect(canAccessAdmin('user')).toBe(false)
    expect(canAccessAdmin('reviewer')).toBe(false)
    expect(canEditAdmin('user')).toBe(false)
  })
})
