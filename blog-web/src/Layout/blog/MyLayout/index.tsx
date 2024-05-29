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
        ©2023 Created By 心中没有白月光
        <p>黑ICP备2024017494号</p>
        {/* 
        黑ICP备2024017494号 <br />
        ©2023 Created By 心中没有白月光
        */}
        {/* <p>©2023 Created By 心中没有白月光</p> */}
      </Footer>
      <FloatButton.Group shape="circle">
        <FloatButton
          tooltip={<div>跳转到后台管理系统</div>}
          onClick={() => {
            window.location.href = import.meta.env.VITE_ADMIN_URL
          }}
        />
        <FloatButton.BackTop visibilityHeight={0} />
      </FloatButton.Group>
    </div>
  )
}
