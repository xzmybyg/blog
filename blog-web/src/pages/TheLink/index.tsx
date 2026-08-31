import { getLinkList, applyLink } from '@/apis'
import type { FormValues } from '@/apis/lib/link'

import { Avatar } from 'antd'
const { Meta } = Card

import Style from './index.module.scss'

function TheLink() {
  const { linkPage, listWrap, linkItem, content, formWrap, notice, linkForm, formItem, aside } = Style

  const [linkList, setLinkList] = useState([])
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
        <h1>友链</h1>
        <div className={listWrap}>
          {linkList.map((item: any) => (
            <a key={item.id} className={linkItem} href={item.url} target="_blank" rel="noreferrer" aria-label={`访问 ${item.title}（新标签页）`}>
            <Card>
              {/* <Skeleton avatar active> */}
              <Meta avatar={<Avatar src={item.logo} />} title={item.title} description={item.describe} />
              {/* </Skeleton> */}
            </Card>
            </a>
          ))}
        </div>
        <Divider>申请友链</Divider>
        <div className={formWrap}>
          <div className={notice}>
            <h2>友链格式：</h2>
            <p>标题：心中没有白月光</p>
            <p>描述：孩儿立志出乡关，学不成名誓不还</p>
            <p>网址：https://www.xzmybyg.com</p>
            <p>头像：https://www.xzmybyg.com/logo.png</p>
          </div>
          <div className={linkForm}>
            <Form onFinish={(values) => submit(values)} noValidate layout="vertical">
              <Form.Item className={formItem} label="标题" name="title" rules={[{ required: true, message: '请输入网站名称' }]}>
                <Input placeholder="网站名称" />
              </Form.Item>
              <Form.Item className={formItem} label="描述" name="describe" rules={[{ required: true, message: '请输入网站描述' }]}>
                <Input placeholder="网站描述" />
              </Form.Item>
              <Form.Item className={formItem} label="网址" name="url" rules={[{ required: true, message: '请输入网站地址' }, { type: 'url', message: '请输入完整的 https:// 地址' }]}>
                <Input placeholder="网站地址" />
              </Form.Item>
              <Form.Item className={formItem} label="头像" name="logo" rules={[{ required: true, message: '请输入头像地址' }, { type: 'url', message: '请输入完整的图片地址' }]}>
                <Input placeholder="网站logo" />
              </Form.Item>
              <Form.Item className={formItem}>
                <Button type="primary" htmlType="submit">
                  申请友链
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
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
