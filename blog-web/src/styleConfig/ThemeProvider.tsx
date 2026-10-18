import type { ReactNode } from 'react'
import { ConfigProvider } from 'antd'
import getTheme from './antdConfig'
import useThemeStore from '@/store/theme'

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useThemeStore((state) => state.theme)
  return <ConfigProvider theme={getTheme(theme)}>{children}</ConfigProvider>
}
