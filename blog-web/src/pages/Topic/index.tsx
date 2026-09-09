//第三方库
import ReactMarkdown from 'react-markdown'
import MarkdownNavbar from 'markdown-navbar'
import { Affix, Button, Card } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined, DownloadOutlined } from '@ant-design/icons'
const { TextArea } = Input
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism'

//api引入
import { getArticleNavigation, getTopic } from '@/apis'

import { default as CommentList } from '@/components/CommentList'

//样式引入
import 'github-markdown-css'
import 'markdown-navbar/dist/navbar.css'
import Style from './index.module.scss'
import useUserStore from '@/store/user'

type TopicProps = {
  id: string
}

export default function Topic() {
  const { topic, topicWrap, markdownBody, affixNavbar, NavbarCard, Navbar, chapterNavigation, chapterLink, chapterMeta, chapterPrevious, chapterNext } = Style
  const { id } = useParams<TopicProps>()
  const article_id = parseInt(id as string, 10)

  const { id: user_id } = useUserStore()

  const [mdContent, setMdContent] = useState('')
  const [commentList, setCommentList] = useState<any[]>([])
  const [navigation, setNavigation] = useState<ArticleNavigation | null>(null)

  useEffect(() => {
    getTopic(article_id).then((res) => {
      setMdContent(res.data)
    })
    getArticleNavigation(article_id)
      .then((res) => setNavigation(res.data))
      .catch(() => setNavigation(null))
  }, [article_id])

  useEffect(() => {
    getComment(article_id).then((res) => {
      setCommentList(res.data)
    })
  }, [article_id])

  const handleComment = (values: any) => {
    if (!user_id) {
      message.error('请先登录')
      return
    }
    const params = { ...values, article_id, user_id }
    addComments(params).then(() => {
      message.success('评论成功')
      getComment(article_id).then((res) => {
        setCommentList(res.data)
      })
    })
  }

  const handleDataUpdate = () => {
    getComment(article_id).then((res) => {
      setCommentList(res.data)
    })
  }

  return (
    <div id={topic} className={`pages`}>
      <div className={topicWrap}>
        <article aria-label="文章正文">
        <ReactMarkdown
          className={`${markdownBody} markdown-body`}
          children={mdContent}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return match ? (
                <SyntaxHighlighter style={okaidia} language={match[1]} PreTag="div" {...props}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
          }}
        />
        </article>
        <nav className={chapterNavigation} aria-label="专题章节导航">
          <div className={chapterMeta}>
            <div>
              <span>{navigation?.topic ? `专题 · ${navigation.topic.name}` : 'MARKDOWN'}</span>
              {navigation?.topic && <small>第 {navigation.position} / {navigation.total} 章</small>}
            </div>
            <Button
              href={`/api/topic?id=${article_id}&download=1`}
              icon={<DownloadOutlined />}
            >
              下载 Markdown
            </Button>
          </div>
          {navigation?.topic && (
            <div className={chapterLink}>
              {navigation.previous ? (
                <Link className={chapterPrevious} to={`/topic/${navigation.previous.id}`}>
                  <ArrowLeftOutlined aria-hidden="true" />
                  <span><small>上一章</small>{navigation.previous.title}</span>
                </Link>
              ) : <span aria-hidden="true" />}
              {navigation.next && (
                <Link className={chapterNext} to={`/topic/${navigation.next.id}`}>
                  <span><small>下一章</small>{navigation.next.title}</span>
                  <ArrowRightOutlined aria-hidden="true" />
                </Link>
              )}
            </div>
          )}
        </nav>
        <Divider />
        <div className="handleComment">
          <h2>评论</h2>
          <Form onFinish={handleComment} noValidate>
            <Form.Item name="content" label="评论内容" rules={[{ required: true, message: '请写下评论内容' }]}>
              <TextArea rows={5} placeholder="分享你的想法或补充…" maxLength={1000} showCount />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                提交评论
              </Button>
            </Form.Item>
          </Form>
          {commentList.map((item) => (
            <CommentList key={item.comment_id} data={{ ...item, article_id }} onDataUpdate={handleDataUpdate} />
          ))}
        </div>
      </div>
      <Affix className={`${affixNavbar} aside`} offsetTop={10}>
        <Card className={NavbarCard}>
          <MarkdownNavbar className={`${Navbar} markdown-Navbar`} source={mdContent} ordered={false} />
        </Card>
      </Affix>
    </div>
  )
}
