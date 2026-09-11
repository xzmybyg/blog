import { getLinkList, applyLink } from '@/apis'
import type { FormValues } from '@/apis/lib/link'

import { Avatar } from 'antd'
import { ExportOutlined } from '@ant-design/icons'

import Style from './index.module.scss'

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\\./, '')
  } catch {
    return url
  }
}

function TheLink() {
  const { linkPage, pageHeader, siteCount, listWrap, linkItem, linkCopy, emptyList, content, applySection, formWrap, notice, linkForm, formItem, aside } = Style

  const [linkList, setLinkList] = useState<Link[]>([])
  useEffect(() => {
    getLinkList().then((res) => {
      setLinkList(res.data)
    })
  }, [])

  const [messageApi, contextHolder] = message.useMessage()

  const submit = (values: FormValues) => {
    applyLink(values)
      .then(() => {
        messageApi.open({
          type: 'success',
          content: '申请成功，等待审核！',
        })
      })
      .catch(() => {
        messageApi.open({
          type: 'error',
          content: '申请失败，请重试！',
        })
      })
  }

  return (
    <div id={linkPage} className={`pages`}>
      {contextHolder}
      <Card className={content}>
        <header className={pageHeader}>
          <div>
            <span>LINK EXCHANGE / 友链目录</span>
            <h1>在独立站点之间，<br />保留一条可抵达的路。</h1>
            <p>这里收录持续创作的个人博客与技术站点。</p>
          </div>
          <strong className={siteCount}><b>{linkList.length}</b><span>SITES</span></strong>
        </header>

        {linkList.length > 0 ? (
          <div className={listWrap}>
            {linkList.map((item) => (
              <a key={item.id} className={linkItem} href={item.url} target="_blank" rel="noreferrer" aria-label={`访问 ${item.title}（新标签页）`}>
                <Avatar size={54} src={item.logo}>{item.title.slice(0, 1)}</Avatar>
                <div className={linkCopy}>
                  <strong>{item.title}</strong>
                  <p>{item.describe || '去看看这个站点最近在写什么。'}</p>
                  <span>{getHostname(item.url)}</span>
                </div>
                <ExportOutlined aria-hidden="true" />
              </a>
            ))}
          </div>
        ) : (
          <div className={emptyList}><strong>目录暂时为空</strong><span>欢迎成为这里的第一位邻居。</span></div>
        )}

        <section className={applySection}>
          <header>
            <span>ADD YOUR SITE / 申请收录</span>
            <h2>交换一张网络名片</h2>
            <p>提交后会进入审核，通过后展示在上方目录中。</p>
          </header>
          <div className={formWrap}>
            <aside className={notice}>
              <strong>本站信息</strong>
              <dl>
                <div><dt>名称</dt><dd>心中没有白月光</dd></div>
                <div><dt>描述</dt><dd>孩儿立志出乡关，学不成名誓不还</dd></div>
                <div><dt>网址</dt><dd>https://www.xzmybyg.cn</dd></div>
                <div><dt>头像</dt><dd>https://www.xzmybyg.cn/blog/blog-icon.jpg</dd></div>
              </dl>
            </aside>
            <div className={linkForm}>
              <Form onFinish={(values) => submit(values)} noValidate layout="vertical">
                <Form.Item className={formItem} label="网站名称" name="title" rules={[{ required: true, message: '请输入网站名称' }]}>
                  <Input placeholder="例如：我的技术笔记" />
                </Form.Item>
                <Form.Item className={formItem} label="一句话描述" name="describe" rules={[{ required: true, message: '请输入网站描述' }]}>
                  <Input placeholder="这个站点主要分享什么？" />
                </Form.Item>
                <Form.Item className={formItem} label="网站地址" name="url" rules={[{ required: true, message: '请输入网站地址' }, { type: 'url', message: '请输入完整的 https:// 地址' }]}>
                  <Input placeholder="https://example.com" />
                </Form.Item>
                <Form.Item className={formItem} label="头像地址" name="logo" rules={[{ required: true, message: '请输入头像地址' }, { type: 'url', message: '请输入完整的图片地址' }]}>
                  <Input placeholder="https://example.com/avatar.png" />
                </Form.Item>
                <Form.Item className={formItem}>
                  <Button type="primary" htmlType="submit">提交申请</Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </section>
      </Card>

      <div className={`aside ${aside}`}>
        <Flex gap="small" vertical>
          <BlogAside></BlogAside>
          <BlogAside.PublicNotice></BlogAside.PublicNotice>
          <BlogAside.Website></BlogAside.Website>
        </Flex>
      </div>
    </div>
  )
}

export default TheLink
