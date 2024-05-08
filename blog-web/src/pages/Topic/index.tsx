//第三方库
import ReactMarkdown from "react-markdown"
import MarkdownNavbar from "markdown-navbar"
import { Card, Affix } from "antd"
const { TextArea } = Input

//api引入
import { getTopic } from "@/apis"

import { default as CommentList } from "@/components/CommentList"

//样式引入
import "github-markdown-css"
import "markdown-navbar/dist/navbar.css"
import Style from "./index.module.scss"
import useUserStore from "@/store/user"

type TopicProps = {
  id: string
}

export default function Topic() {
  const { topic, topicWrap, markdownBody, affixNavbar, NavbarCard, Navbar } =
    Style
  const { id } = useParams<TopicProps>()
  const article_id = parseInt(id as string, 10)

  const { id: user_id } = useUserStore()

  const [mdContent, setMdContent] = useState("")
  const [commentList, setCommentList] = useState<any[]>([])

  useEffect(() => {
    getTopic(article_id).then((res) => {
      setMdContent(res.data)
    })
  }, [])

  useEffect(() => {
    getComment(article_id).then((res) => {
      setCommentList(res.data)
    })
  }, [article_id])

  const handleComment = (values: any) => {
    if (!user_id) {
      message.error("请先登录")
      return
    }
    const params = { ...values, article_id, user_id }
    addComments(params).then(() => {
      message.success("评论成功")
      getComment(article_id).then((res) => {
        setCommentList(res.data)
      })
    })
  }

  return (
    <div id={topic} className={`pages`}>
      <div className={topicWrap}>
        <ReactMarkdown
          className={`${markdownBody} markdown-body`}
          children={mdContent}
        />
        <Divider />
        <div className="handleComment">
          <h2>评论</h2>
          <Form onFinish={handleComment}>
            <Form.Item name="content">
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                提交评论
              </Button>
            </Form.Item>
          </Form>
          {commentList.map((item) => (
            <CommentList key={item.comment_id} data={{ ...item, article_id }} />
          ))}
        </div>
      </div>
      <Affix className={`${affixNavbar} aside`} offsetTop={10}>
        <Card className={NavbarCard}>
          <MarkdownNavbar
            className={`${Navbar} markdown-Navbar`}
            source={mdContent}
            ordered={false}
          />
        </Card>
      </Affix>
    </div>
  )
}
