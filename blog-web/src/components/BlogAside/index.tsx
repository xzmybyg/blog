import { Avatar, Popover } from 'antd'
import { GithubOutlined, LinkOutlined, WechatOutlined } from '@ant-design/icons'

import PublicNotice from './PublicNotice'
import Website from './Website'
import LabelCard from './LabelCard'

import Style from './index.module.scss'
const { introduction, wechat, jello } = Style

function Wechat() {
  const WechatContent = <img className={wechat} src="/MyWechat.jpg" alt="加载失败" />
  return (
    <Popover content={WechatContent}>
      <WechatOutlined />
    </Popover>
  )
}

function MyGithub() {
  const github = 'https://github.com/xzmybyg'

  return (
    <GithubOutlined
      onClick={() => {
        window.open(github)
      }}
    />
  )
}
function BlogAside() {
  const IntroductionActions = [<MyGithub key="github" />, <Wechat key="wechat" />, <LinkOutlined key="gitee" />]

  return (
    <>
      <Card className={introduction} style={{ width: 300 }} actions={IntroductionActions}>
        <Space wrap size={16}>
          <Avatar
            className={jello}
            size={64}
            src={'/blog-icon.jpg'}
            alt="加载失败"
            style={{
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
              marginBottom: 10,
            }}
          />
          <b>心中没有白月光</b>
        </Space>
        <p>前端开发</p>
        <p>现居：北京</p>
        <p>邮箱：1277215827@qq.com</p>
      </Card>
    </>
  )
}
BlogAside.PublicNotice = PublicNotice
BlogAside.Website = Website
BlogAside.LabelCard = LabelCard

export default BlogAside
