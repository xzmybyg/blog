import { useEffect, type ReactNode } from 'react'
import { ConfigProvider } from 'antd'
import getTheme from './antdConfig'
import useThemeStore from '@/store/theme'
import { getThemeAnimation } from '@/apis/lib/themeAnimation'

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useThemeStore((state) => state.theme)
  const setDurationMs = useThemeStore((state) => state.setDurationMs)

  useEffect(() => {
    getThemeAnimation()
      .then((response) => setDurationMs(response.data.durationMs))
      .catch(() => {}) // Keep the default duration when the settings API is unavailable.
  }, [setDurationMs])

  return <ConfigProvider theme={getTheme(theme)}>{children}</ConfigProvider>
}
