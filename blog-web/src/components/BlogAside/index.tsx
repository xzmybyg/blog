import { Avatar, Popover } from 'antd'
import { EnvironmentOutlined, GithubOutlined, MailOutlined, WechatOutlined } from '@ant-design/icons'

import PublicNotice from './PublicNotice'
import Website from './Website'
import LabelCard from './LabelCard'

import Style from './index.module.scss'
const {
  introduction,
  profileHeader,
  profileIdentity,
  profileMeta,
  profileActions,
  githubAction,
  wechatAction,
  giteeAction,
  wechat,
  jello,
} = Style
const baseURL = import.meta.env.VITE_BASE_URL

function Wechat() {
  const WechatContent = <img className={wechat} src="/MyWechat.jpg" alt="加载失败" />
  return (
    <Popover content={WechatContent} title="微信二维码">
      <button className={wechatAction} type="button" aria-label="查看微信二维码">
        <WechatOutlined />
      </button>
    </Popover>
  )
}

function MyGithub() {
  return (
    <a className={githubAction} href="https://github.com/xzmybyg" target="_blank" rel="noreferrer" aria-label="访问 GitHub">
      <GithubOutlined />
    </a>
  )
}
function BlogAside() {
  return (
      <Card className={introduction} style={{ width: 300 }}>
        <div className={profileHeader}>
          <Avatar
            className={jello}
            size={60}
            src={`${baseURL}/blog-icon.jpg`}
            alt="加载失败"
          />
          <div className={profileIdentity}>
            <span>AUTHOR / 博主</span>
            <strong>心中没有白月光</strong>
            <small>Frontend Developer</small>
          </div>
        </div>
        <div className={profileMeta}>
          <span><EnvironmentOutlined aria-hidden="true" />北京</span>
          <a href="mailto:1277215827@qq.com"><MailOutlined aria-hidden="true" />1277215827@qq.com</a>
        </div>
        <div className={profileActions}>
          <MyGithub />
          <Wechat />
          <a className={giteeAction} href="https://gitee.com/lv-chengye" target="_blank" rel="noreferrer" aria-label="访问 Gitee">
            <i className="iconfont icon-gitee" aria-hidden="true" />
          </a>
        </div>
      </Card>
  )
}
BlogAside.PublicNotice = PublicNotice
BlogAside.Website = Website
BlogAside.LabelCard = LabelCard

export default BlogAside
