import { beforeEach, describe, expect, it, vi } from 'vitest'

function mockSystemTheme(dark: boolean) {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: dark,
    addEventListener: vi.fn(),
  })))
}

describe('theme preference', () => {
  beforeEach(() => {
    vi.resetModules()
    window.localStorage.clear()
    delete document.documentElement.dataset.theme
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
})
