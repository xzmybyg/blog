import { ReactNode } from 'react'

import Style from './index.module.scss'

//第三方库
import { Layout, FloatButton } from 'antd'
const { Content, Footer } = Layout

export default function MyLayout({ children }: { children: ReactNode | ReactNode[] }) {
  // const navgate = useNavigate()
  const contentRef = useRef(null)
  return (
    <div className={`${Style.Layout} layout`} ref={contentRef}>
      <Nav />
      <Content className="blog-content">{children}</Content>
      <Footer
        className="blog-footer"
        style={{
          width: '100vw',
          textAlign: 'center',
        }}
      >
        <span>© 2023–2026 心中没有白月光 · 用代码记录问题，也记录答案</span>
        <p>黑ICP备2024017494号</p>
        {/* 
        黑ICP备2024017494号 <br />
        ©2023 Created By 心中没有白月光
        */}
        {/* <p>©2023 Created By 心中没有白月光</p> */}
      </Footer>
      <FloatButton.Group shape="circle">
        <FloatButton
          tooltip={<div>前往后台管理</div>}
          aria-label="前往后台管理"
          onClick={() => {
            window.location.href = import.meta.env.VITE_ADMIN_URL
          }}
        />
        <FloatButton.BackTop visibilityHeight={320} aria-label="返回页面顶部" />
      </FloatButton.Group>
    </div>
  )
}
