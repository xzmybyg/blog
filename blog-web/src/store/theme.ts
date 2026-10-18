import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

type ThemeStore = {
  theme: ThemeMode
  toggleTheme: () => void
}

const STORAGE_KEY = 'blog-theme'

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
  toggleTheme: () => {
    const theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(theme)
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Theme still switches for this session when storage is unavailable.
    }
    set({ theme })
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
