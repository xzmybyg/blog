import { Avatar, Popover } from "antd";
import {
  GithubOutlined,
  LinkOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import Style from "./index.module.scss";

function Wechat() {
  const WechatContent = (
    <img className={`${Style.wechat}`} src="/MyWechat.jpg" alt="加载失败" />
  );
  return (
    <Popover content={WechatContent}>
      <WechatOutlined />
    </Popover>
  );
}

function MyGithub() {
  const github = "https://github.com/xzmybyg";

  return (
    <GithubOutlined
      onClick={() => {
        window.open(github);
      }}
    />
  );
}

function Introduction() {
  const IntroductionActions = [
    <MyGithub key="github" />,
    <Wechat key="wechat" />,
    <LinkOutlined key="gitee" />,
  ];

  return (
    <>
      <Card
        className="introduction"
        style={{ width: 300 }}
        actions={IntroductionActions}
      >
        <Space wrap size={16}>
          <Avatar size={64} src={"/blog-icon.jpg"} alt="加载失败" />
          <b>心中没有白月光</b>
        </Space>
        <p>前端开发</p>
        <p>现居：北京</p>
        <p>邮箱：1277215827@qq.com</p>
      </Card>
    </>
  );
}

export default Introduction;
