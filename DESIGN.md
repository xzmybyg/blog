---
version: alpha
name: "心中没有白月光 · Developer Field Notes"
description: "面向中文开发者的个人博客，以蓝图工作台的秩序感承载技术写作与个人表达。"
colors:
  primary: "#1857D9"
  primary-deep: "#0B3CA8"
  signal: "#F05A3C"
  ink: "#122033"
  muted: "#58677C"
  canvas: "#F4F7FB"
  surface: "#FFFFFF"
  line: "#D9E1EC"
  success: "#18794E"
  danger: "#C83B31"
typography:
  display:
    fontFamily: "Arial, 'Microsoft YaHei', 'PingFang SC', sans-serif"
  body:
    fontFamily: "'Microsoft YaHei', 'PingFang SC', system-ui, sans-serif"
  mono:
    fontFamily: "'Cascadia Code', 'SFMono-Regular', Consolas, monospace"
rounded:
  sm: "0.375rem"
  DEFAULT: "0.75rem"
  lg: "1.125rem"
spacing:
  unit: "0.5rem"
  section-gap: "3.5rem"
  page-max: "76rem"
components:
  navigation: {}
  button: {}
  card: {}
  article-list: {}
  form: {}
  admin-shell: {}
---

# 心中没有白月光 Design System

## Overview

### Creative North Star

界面参考前端工程师桌上的“蓝图工作台”：冷白底纸、工程蓝标注、细密但克制的测量线，以及代码编辑器中的等宽元信息。它不是终端主题，也不是报纸，而是一套适合持续阅读、浏览与记录的个人知识界面。

### Product context and register

- **Audience and primary job:** 中文前端开发者与技术同好；快速发现文章、舒适阅读长文，并了解作者与社区联系入口。
- **Target market(s) and evidence:** 中文互联网；现有路由、内容和备案信息均为中文，未声明日本市场或其他受监管场景。
- **Locale(s) and language policy:** 界面使用简体中文；技术名词保留行业通用英文写法。
- **Usage scene:** 桌面端深度阅读与移动端碎片浏览并重，页面内容密度中等。
- **Register:** 公共内容型品牌站点与登录后的内容管理工作台；后台复用同一语义令牌，以更紧凑的密度承载表格与表单任务。
- **Memorable signature:** 标题和文章信息旁的“代码行号 / 测量刻度”信息轨，只在关键位置出现。
- **Restraint:** 正文、表单与导航保持安静；不使用大面积渐变、玻璃卡片或到处漂浮的动效。
- **Anti-references:** 避免暖米色＋高对比衬线＋陶土色的通用编辑风；避免暗色终端＋荧光色的刻板开发者主题；避免新闻报纸式密集分栏。
- **Token ownership/runtime mapping:** 本文件镜像并解释运行时规范；`blog-web/src/styleConfig/scssConfig.scss` 是运行时令牌的唯一实现源，共享页面和组件只消费语义变量。

## Colors

`primary` 是链接、焦点与主要操作的工程蓝；`signal` 仅用于小面积状态和签名刻度。`canvas` 与 `surface` 区分页面和阅读表面，`line` 承担主要层级，阴影只辅助浮层。文本使用 `ink` / `muted` 两级。错误与成功拥有独立语义色，不依赖颜色单独传达含义。

## Typography

标题使用紧凑的 Arial 与中文黑体回退，正文使用系统中文无衬线以降低长文阅读疲劳；日期、标签、眉题和技术元信息使用 Cascadia Code/Consolas 等宽栈。正文行高 1.8–1.9，文章最大行长约 72ch。标题不使用全大写中文，英文短标签可用适度字距。

## Layout

桌面内容最大宽度 76rem，主栏与 18rem 侧栏组成稳定网格；窄于 56rem 时侧栏退出布局，正文自然滚动。页面间距以 0.5rem 为基准，标题区与内容区通过细线和留白分隔。媒体提前保留宽高比，避免加载时跳动。

## Elevation & Depth

静态内容依靠白色表面、描边与相邻背景建立层级；卡片默认不悬浮。仅移动菜单、弹层和 hover 中的可导航文章使用轻微阴影。禁止在长文正文周围使用厚重阴影或模糊玻璃。

## Shapes

控件使用 0.75rem 圆角，内容容器使用 1.125rem，标签使用小圆角而非药丸形。头像可保持圆形。分隔线为 1px 冷灰蓝，签名刻度使用 3px 信号橙短线。

## Components

### Foundational visual states

交互元素必须具备 hover、active、focus-visible 与 disabled/busy 状态。焦点环使用 3px 半透明工程蓝。加载区保留最终布局高度；系统支持 `prefers-reduced-motion` 时取消位移、缩放和循环动画。

### Buttons and actions

主操作为工程蓝实底；次操作使用白底描边或文字样式。图标按钮必须有可访问名称，最小触控尺寸 44px。危险操作只使用危险语义样式，并与安全操作分隔。

### Navigation and data display

导航使用真实链接并显示当前路由；移动菜单由带 `aria-expanded` 的按钮控制。文章列表以日期/标签元信息轨加标题摘要组成，整张卡片可导航但保持语义链接。分页保持在列表底部并提供稳定留白。

### Forms and overlays

所有字段有可见标签、中文校验提示、错误关联与稳定的帮助文本区域。留言与评论文本域不允许手工缩放，提供足够默认高度。通知由 Ant Design 的共享消息系统承载。

### Iconography

沿用现有 Ant Design Icons 与项目 iconfont；图标只补充文本语义。仅通用菜单、返回顶部、社交平台等可使用图标按钮，并提供可访问名称。

### Motion

只保留一次性的内容进入、图片 hover 与菜单开合反馈，时长 160–280ms，使用平滑减速。动效表达层级变化，不作为持续装饰。

### Content and data visualization

文案直白、具体、使用主动语态；按钮名称与成功反馈一致。日期统一 `YYYY-MM-DD`，技术标签保持原始大小写。

## Do's and Don'ts

- **Do:** 用工程蓝、等宽元信息和短刻度建立开发者身份。
- **Do:** 让文章发现、长文阅读和移动导航在所有页面保持同一节奏。
- **Don't:** 用玻璃拟态、大面积渐变或厚重阴影制造“高级感”。
- **Don't:** 用不可聚焦的 `div` 承担导航，或仅靠 hover 表达可点击性。
