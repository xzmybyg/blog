// import { useTyped } from "@/hooks"
import { default as Barrage } from '@/components/Barrage'
import Style from './index.module.scss'
import useUserStore from '@/store/user'
import useSiteBackground from '@/hooks/useSiteBackground'
import { postMessage, getMessage } from '@/apis/lib/message'

const { messagePage, sendWrap, formWarp } = Style

function Message() {
  const backgroundUrl = useSiteBackground('message')
  // const el = useTyped(["我是心中没有白月光,<br/>欢迎来到我的博客", ""], {
  //   loop: true,
  // })
  const { id } = useUserStore()
  const [comments, setComments] = useState<TheComment[]>([])
  const [sending, setSending] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    getMessage().then((res) => {
      setComments(res.data)
    })
  }, [])

  const sendMessage = async (values: any) => {
    if (!id) {
      message.error('请先登录')
      return
    }
    setSending(true)
    try {
      const response = await postMessage(id, values.content)
      setComments((comments) => [...comments, response.data])
      form.resetFields()
    } catch (error: any) {
      message.error(error.response?.data?.message || '留言失败，请稍后重试')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      id={messagePage}
      className="message-page"
      style={{ '--site-background': `url("${backgroundUrl}")` } as React.CSSProperties}
    >
      <div className={sendWrap}>
        <span className={Style.eyebrow}>OPEN MESSAGE WALL</span>
        <h1>留言板</h1>
        <p>分享一个想法、问题，或者简单打个招呼。</p>
        <Form form={form} className={formWarp} onFinish={sendMessage} noValidate>
          <Space.Compact block>
            <Form.Item name="content" rules={[{ required: true, message: '请输入留言内容' }]}>
              <Input aria-label="留言内容" placeholder="写下你的留言…" maxLength={200} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={sending}>
                发送
              </Button>
            </Form.Item>
          </Space.Compact>
        </Form>
      </div>
      {/* <span ref={el}></span> */}
      <Barrage comments={comments} />
    </div>
  )
}

export default Message
