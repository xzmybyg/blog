// import { useTyped } from "@/hooks"
import { default as Barrage } from "@/components/Barrage"
import type { Comment } from "@/types"
import Style from "./index.module.scss"
import useUserStore from "@/store/user"
import { postMessage, getMessage } from "@/apis/lib/message"

const { messagePage, sendWrap, formWarp } = Style

function Message() {
  // const el = useTyped(["我是心中没有白月光,<br/>欢迎来到我的博客", ""], {
  //   loop: true,
  // })
  const { id } = useUserStore()
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    getMessage().then(res => {
      setComments(res.data)
    })
  }, [])

  const sendMessage = (values: any) => {
    if (!id) {
      message.error("请先登录")
      return
    }
    // 返回 postMessage 的调用
    postMessage(id, values.content).then(res => {
      setComments(comments => [...comments, res.data])
    })
  }

  return (
    <div id={messagePage}>
      <div className={sendWrap}>
        留言板
        <Form className={formWarp} onFinish={sendMessage}>
          <Space.Compact>
            <Form.Item name="content">
              <Input></Input>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
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
