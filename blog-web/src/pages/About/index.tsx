import ReactMarkdown from 'react-markdown'
import { Alert, Skeleton } from 'antd'
import 'github-markdown-css'
import './index.scss'

const baseURL = import.meta.env.VITE_BASE_URL

function About() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  const loadContent = useCallback(() => {
    setLoading(true)
    setLoadFailed(false)
    getAboutContent()
      .then((response) => setContent(response.data))
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  return (
    <div id="aboutpage" className="pages">
      <Card className="card">
        <img className="animal_avatars" src={`${baseURL}/animal_avatars.png`} alt="" aria-hidden="true" />
        <header className="about-header">
          <Avatar className="avatar jello" src={`${baseURL}/blog-icon.jpg`} alt="作者头像" size={80} />
          <div>
            <span className="aboutEyebrow">ABOUT THE AUTHOR</span>
            <p>关于作者、技术栈与这个博客。</p>
          </div>
        </header>

        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} title={{ width: '42%' }} />
        ) : loadFailed ? (
          <Alert
            type="error"
            showIcon
            message="关于页内容加载失败"
            description={<Button type="link" onClick={loadContent}>重新加载</Button>}
          />
        ) : (
          <article className="about-markdown markdown-body" aria-label="关于页正文">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        )}
      </Card>
    </div>
  )
}

export default About
