import { getLinkList, applyLink } from "@/apis";
import type { FormValues } from "@/apis/lib/link";

import { Avatar } from "antd";
const { Meta } = Card;

import Style from "./index.module.scss";

function TheLink() {
  const {
    linkPage,
    listWrap,
    linkItem,
    content,
    formWrap,
    notice,
    linkForm,
    formItem,
    aside,
  } = Style

  const [linkList, setLinkList] = useState([])
  useEffect(() => {
    getLinkList().then(res => {
      setLinkList(res.data)
    })
  }, [])

  const gotoLink = (url: string) => {
    window.open(url, "_blank")
  }

  const [messageApi, contextHolder] = message.useMessage()

  const submit = (values: FormValues) => {
    applyLink(values)
      .then(_res => {
        messageApi.open({
          type: "success",
          content: "申请成功，等待审核！",
        })
      })
      .catch(_err => {
        messageApi.open({
          type: "error",
          content: "申请失败，请重试！",
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
            <Card
              key={item.id}
              className={linkItem}
              onClick={() => {
                gotoLink(item.url)
              }}
            >
              {/* <Skeleton avatar active> */}
              <Meta
                avatar={<Avatar src={item.logo} />}
                title={item.title}
                description={item.describe}
              />
              {/* </Skeleton> */}
            </Card>
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
            <Form onFinish={values => submit(values)}>
              <Form.Item className={formItem} label="标题" name="title">
                <Input placeholder="网站名称" />
              </Form.Item>
              <Form.Item className={formItem} label="描述" name="describe">
                <Input placeholder="网站描述" />
              </Form.Item>
              <Form.Item className={formItem} label="网址" name="url">
                <Input placeholder="网站地址" />
              </Form.Item>
              <Form.Item className={formItem} label="头像" name="logo">
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

export default TheLink;
