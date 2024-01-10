import { ReactNode } from "react";

import Style from "./index.module.scss";

//第三方库
import { Layout, FloatButton } from "antd";
const { Content, Footer } = Layout;

export default function MyLayout({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  const contentRef = useRef(null);
  return (
    <div className={Style.Layout} ref={contentRef}>
      <Nav />
      <Content className="blog-content">{children}</Content>
      <Footer
        className="blog-footer"
        style={{
          width: "100vw",
          textAlign: "center",
        }}
      >
        ©2023 Created By 心中没有白月光
      </Footer>
      <FloatButton.BackTop target={() => contentRef?.current || document} />
    </div>
  );
}
