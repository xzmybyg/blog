import { Avatar, Popover } from "antd";
import {
  GithubOutlined,
  LinkOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import "./Introduction.module.scss";

const content = <img className="wechat" src="/MyWechat.jpg" alt="加载失败" />;

function Wechat() {
  return (
    <Popover content={content}>
      <WechatOutlined />
    </Popover>
  );
}

const github = "https://github.com/xzmybyg";

function MyGithub() {
  return (
    <GithubOutlined
      onClick={() => {
        window.open(github);
      }}
    />
  );
}

function Introduction() {
  return (
    <>
      <Card
        className="side"
        style={{ width: 300 }}
        actions={[
          <MyGithub key="github" />,
          <Wechat key="wechat" />,
          <LinkOutlined key="gitee" />,
        ]}
      >
        <Space wrap size={16}>
          <Avatar size={64} src={"/blog-icon.jpg"} alt="加载失败" />
          <b>心中没有白月光</b>
        </Space>
        <p>前端开发</p>
        <p>现居：北京</p>
        <p>邮箱：1277215827@qq.com</p>
      </Card>
      <div className="introduction"></div>
    </>
  );
}

export default Introduction;
