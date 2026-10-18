import { theme as antdTheme, type ThemeConfig } from 'antd'
import type { ThemeMode } from '@/store/theme'
/**
 * @desc antd主题配置
 */

const getTheme = (mode: ThemeMode): ThemeConfig => ({
  algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  token: mode === 'dark'
    ? {
        colorPrimary: '#c8a47a',
        colorBgBase: '#252728',
        colorTextBase: '#eee9e1',
        colorBorder: '#46443f',
      }
    : {
        colorPrimary: '#7e70ea',
        lineWidthFocus: 0,
      },
  components: {
    Pagination: {
      itemActiveBg: mode === 'dark' ? '#252728' : '#fff',
      itemActiveColor: mode === 'dark' ? '#e0bf99' : '#1857d9',
      itemBg: mode === 'dark' ? '#252728' : '#fff',
      itemLinkBg: mode === 'dark' ? '#252728' : '#fff',
    },
    Timeline: {
      itemPaddingBottom: 50,
      tailWidth: 5,
    },
  },
})

export default getTheme
