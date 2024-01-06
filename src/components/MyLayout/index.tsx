import { Footer } from "antd/es/layout/layout";
import React from "react";

const MyLayout: React.FC = () => {
  return (
    <div className="layout">
      <Nav />
      <div className="content">
        <Routes></Routes>
      </div>
      <Footer
        className="blog-footer"
        style={{
          width: "100vw",
          textAlign: "center",
        }}
      >
        ©2023 Created By 心中没有白月光
      </Footer>
    </div>
  );
};

export default MyLayout;
