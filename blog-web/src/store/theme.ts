import { create } from 'zustand'
import { flushSync } from 'react-dom'

export type ThemeMode = 'light' | 'dark'
export const DEFAULT_THEME_ANIMATION_MS = 600
export const MIN_THEME_ANIMATION_MS = 200
export const MAX_THEME_ANIMATION_MS = 1500

type ThemeStore = {
  theme: ThemeMode
  durationMs: number
  setDurationMs: (durationMs: number) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'blog-theme'
let activeTransition: ReturnType<Document['startViewTransition']> | null = null

function systemTheme(): ThemeMode {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function savedTheme(): ThemeMode | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) meta.content = theme === 'dark' ? '#1b1d1e' : '#faf9f7'
}

const initialTheme: ThemeMode = typeof document === 'undefined'
  ? 'light'
  : savedTheme() ?? systemTheme()

if (typeof document !== 'undefined') applyTheme(initialTheme)

const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: initialTheme,
  durationMs: DEFAULT_THEME_ANIMATION_MS,
  setDurationMs: (durationMs) => {
    if (Number.isInteger(durationMs) && durationMs >= MIN_THEME_ANIMATION_MS && durationMs <= MAX_THEME_ANIMATION_MS) {
      set({ durationMs })
    }
  },
  toggleTheme: () => {
    const theme = get().theme === 'dark' ? 'light' : 'dark'
    const updateTheme = () => {
      applyTheme(theme)
      try {
        window.localStorage.setItem(STORAGE_KEY, theme)
      } catch {
        // Theme still switches for this session when storage is unavailable.
      }
      set({ theme })
    }

    if (activeTransition) {
      activeTransition.skipTransition()
      activeTransition = null
      document.documentElement.classList.remove('theme-reveal')
      document.documentElement.style.removeProperty('--theme-reveal-radius')
      document.documentElement.style.removeProperty('--theme-reveal-duration')
    }
    if (typeof document.startViewTransition !== 'function' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      updateTheme()
      return
    }

    const root = document.documentElement
    root.style.setProperty('--theme-reveal-radius', `${Math.hypot(window.innerWidth, window.innerHeight)}px`)
    root.style.setProperty('--theme-reveal-duration', `${get().durationMs}ms`)
    const transition = document.startViewTransition(() => {
      root.classList.add('theme-reveal')
      flushSync(updateTheme)
    })
    activeTransition = transition
    const cleanup = () => {
      if (activeTransition !== transition) return
      activeTransition = null
      root.classList.remove('theme-reveal')
      root.style.removeProperty('--theme-reveal-radius')
      root.style.removeProperty('--theme-reveal-duration')
    }
    void transition.finished.then(cleanup, cleanup)
  },
}))

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (savedTheme()) return
    const theme = event.matches ? 'dark' : 'light'
    applyTheme(theme)
    useThemeStore.setState({ theme })
  })
}

export default useThemeStore
