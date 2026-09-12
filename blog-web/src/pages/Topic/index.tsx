//第三方库
import ReactMarkdown from 'react-markdown'
import MarkdownNavbar from 'markdown-navbar'
import { Affix, Button, Card } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined, DownloadOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons'
const { TextArea } = Input
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism'

//api引入
import { getArticleLikes, getArticleNavigation, getTopic, likeArticle } from '@/apis'
import { getVisitorId } from '@/utils/visitorId'
import { isRequestThrottled } from '@/utils/requestThrottle'

import { default as CommentList } from '@/components/CommentList'

//样式引入
import 'github-markdown-css'
import 'markdown-navbar/dist/navbar.css'
import Style from './index.module.scss'
import useUserStore from '@/store/user'

type TopicProps = {
  id: string
}

function hasLikedArticle(articleId: number) {
  try {
    return localStorage.getItem(`blog-article-liked-${articleId}`) === '1'
  } catch {
    return false
  }
}

function markArticleLiked(articleId: number) {
  try {
    localStorage.setItem(`blog-article-liked-${articleId}`, '1')
  } catch {
    // 服务端仍会根据匿名访客 ID 阻止重复点赞。
  }
}

export default function Topic() {
  const { topic, topicWrap, markdownBody, affixNavbar, NavbarCard, Navbar, articleLike, articleLikeActive, chapterNavigation, chapterLink, chapterMeta, chapterPrevious, chapterNext } = Style
  const { id } = useParams<TopicProps>()
  const article_id = parseInt(id as string, 10)

  const { id: user_id } = useUserStore()

  const [mdContent, setMdContent] = useState('')
  const [commentList, setCommentList] = useState<any[]>([])
  const [navigation, setNavigation] = useState<ArticleNavigation | null>(null)
  const [likes, setLikes] = useState<number | null>(null)
  const [liked, setLiked] = useState(false)
  const [liking, setLiking] = useState(false)
  const [commenting, setCommenting] = useState(false)
  const [commentForm] = Form.useForm()

  useEffect(() => {
    getTopic(article_id).then((res) => {
      setMdContent(res.data)
    })
    getArticleNavigation(article_id)
      .then((res) => setNavigation(res.data))
      .catch(() => setNavigation(null))
    getArticleLikes(article_id)
      .then((res) => setLikes(Number(res.data.likes) || 0))
      .catch(() => setLikes(null))
    setLiked(hasLikedArticle(article_id))
  }, [article_id])

  useEffect(() => {
    getComment(article_id).then((res) => {
      setCommentList(res.data)
    })
  }, [article_id])

  const handleComment = async (values: any) => {
    if (!user_id) {
      message.error('请先登录')
      return
    }
    const params = { ...values, article_id, user_id }
    setCommenting(true)
    try {
      await addComments(params)
      message.success('评论成功')
      commentForm.resetFields()
      const response = await getComment(article_id)
      setCommentList(response.data)
    } catch (error: any) {
      message.error(error.response?.data?.message || '评论失败，请稍后重试')
    } finally {
      setCommenting(false)
    }
  }

  const handleDataUpdate = () => {
    getComment(article_id).then((res) => {
      setCommentList(res.data)
    })
  }

  const handleLike = async () => {
    if (liked || liking) return
    if (isRequestThrottled(`article-like:${article_id}`, 1000)) return

    const visitorId = getVisitorId()
    if (!visitorId) {
      message.error('浏览器存储不可用，暂时无法点赞')
      return
    }

    setLiking(true)
    try {
      const response = await likeArticle(article_id, visitorId)
      setLikes(Number(response.data.likes) || 0)
      setLiked(true)
      markArticleLiked(article_id)
      message.success('感谢你的喜欢')
    } catch (error: any) {
      message.error(error.response?.data?.message || '点赞失败，请稍后重试')
    } finally {
      setLiking(false)
    }
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
        <div className={`${articleLike} ${liked ? articleLikeActive : ''}`}>
          <Button
            type="text"
            icon={liked ? <HeartFilled /> : <HeartOutlined />}
            loading={liking}
            aria-pressed={liked}
            onClick={handleLike}
          >
            {liked ? '已喜欢' : '喜欢这篇'}
            <span>{likes === null ? '--' : likes.toLocaleString('zh-CN')}</span>
          </Button>
        </div>
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
          <Form form={commentForm} onFinish={handleComment} noValidate>
            <Form.Item name="content" label="评论内容" rules={[{ required: true, message: '请写下评论内容' }]}>
              <TextArea rows={5} placeholder="分享你的想法或补充…" maxLength={1000} showCount />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={commenting}>
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
