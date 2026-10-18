import { beforeEach, describe, expect, it, vi } from 'vitest'

function mockSystemTheme(dark: boolean, reducedMotion = false) {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reducedMotion : dark,
    addEventListener: vi.fn(),
  })))
}

describe('theme preference', () => {
  beforeEach(() => {
    vi.resetModules()
    window.localStorage.clear()
    delete document.documentElement.dataset.theme
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: undefined })
  })

  it('uses the system preference on the first visit', async () => {
    mockSystemTheme(true)
    const { default: useThemeStore } = await import('./theme')

    expect(useThemeStore.getState().theme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('blog-theme')).toBeNull()
  })

  it('persists an explicit toggle', async () => {
    mockSystemTheme(false)
    const { default: useThemeStore } = await import('./theme')
    useThemeStore.getState().toggleTheme()

    expect(useThemeStore.getState().theme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('blog-theme')).toBe('dark')
  })

  it('restores the saved theme on reload even when the system differs', async () => {
    mockSystemTheme(true)
    window.localStorage.setItem('blog-theme', 'light')
    const { default: useThemeStore } = await import('./theme')

    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('reveals the new theme from the bottom-left when view transitions are available', async () => {
    mockSystemTheme(false)
    const finished = Promise.resolve()
    const startViewTransition = vi.fn((update: () => void) => {
      update()
      return { finished, skipTransition: vi.fn() }
    })
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: startViewTransition })
    const { default: useThemeStore } = await import('./theme')
    useThemeStore.getState().setDurationMs(900)

    useThemeStore.getState().toggleTheme()

    expect(startViewTransition).toHaveBeenCalledOnce()
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.getPropertyValue('--theme-reveal-radius')).toBe(`${Math.hypot(window.innerWidth, window.innerHeight)}px`)
    expect(document.documentElement.style.getPropertyValue('--theme-reveal-duration')).toBe('900ms')
    await finished
    expect(document.documentElement.classList.contains('theme-reveal')).toBe(false)
  })

  it('switches immediately when reduced motion is preferred', async () => {
    mockSystemTheme(false, true)
    const startViewTransition = vi.fn()
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: startViewTransition })
    const { default: useThemeStore } = await import('./theme')

    useThemeStore.getState().toggleTheme()

    expect(startViewTransition).not.toHaveBeenCalled()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('ignores animation durations outside the supported range', async () => {
    mockSystemTheme(false)
    const { default: useThemeStore } = await import('./theme')

    useThemeStore.getState().setDurationMs(100)
    expect(useThemeStore.getState().durationMs).toBe(600)
    useThemeStore.getState().setDurationMs(1200)
    expect(useThemeStore.getState().durationMs).toBe(1200)
  })
})
