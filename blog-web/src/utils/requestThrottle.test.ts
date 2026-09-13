import { afterEach, describe, expect, it, vi } from 'vitest'
import { isRequestThrottled } from './requestThrottle'

describe('requestThrottle', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('blocks repeated requests until the interval expires', () => {
    vi.useFakeTimers()
    vi.setSystemTime(10_000)
    const key = `request-${Math.random()}`

    expect(isRequestThrottled(key, 1_000)).toBe(false)
    expect(isRequestThrottled(key, 1_000)).toBe(true)

    vi.advanceTimersByTime(1_000)
    expect(isRequestThrottled(key, 1_000)).toBe(false)
  })

  it('tracks request keys independently', () => {
    vi.useFakeTimers()
    vi.setSystemTime(20_000)
    const prefix = `independent-${Math.random()}`

    expect(isRequestThrottled(`${prefix}-a`, 1_000)).toBe(false)
    expect(isRequestThrottled(`${prefix}-b`, 1_000)).toBe(false)
  })
})
