import { ThemeConfig } from 'antd'
/**
 * @desc antd主题配置
 */

const Theme: ThemeConfig = {
  token: {
    /* here is global tokens */
    // colorPrimary:'#1890ff',
    // colorPrimary: "#d6dcff",
    colorPrimary: '#7e70ea',
    lineWidthFocus: 0,
  },
  components: {
    Pagination: {
      /* here is component tokens */
      itemActiveBg: '#fff',
      itemBg: '#000',
      itemLinkBg: '#000',
    },
    Timeline: {
      itemPaddingBottom: 50,
      tailWidth: 5,
    },
  },
}

export default Theme
