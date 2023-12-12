import { ThemeConfig } from "antd";
/**
 * @desc antd主题配置
 */

const Theme: ThemeConfig = {
  token: {
    /* here is your global tokens */
    // colorPrimary:'#1890ff',
    lineWidthFocus: 0,
  },
  components: {
    Pagination: {
      /* here is your component tokens */
      itemActiveBg: "#00c4b6",
      itemBg: "#000",
      itemLinkBg: "#000",
    },
  },
};

export default Theme;
