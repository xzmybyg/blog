import dayjs from 'dayjs'
import { List } from 'antd'
import { getAllArticleList } from '@/apis'
import { Link } from 'react-router-dom'
import './index.scss'

function Article() {
  const [ArticleList, setArticleList] = useState<Article[]>([])
  useEffect(() => {
    getAllArticleList().then((res) => {
      setArticleList(res.data)
    })
  }, [])

  return (
    <>
      <div className="Article pages">
        <Card className="listWrap">
          <header className="articlePageHeader">
            <span>WRITING ARCHIVE</span>
            <h1>文章归档</h1>
            <p>按时间浏览关于 React、TypeScript、工程化与产品体验的实践笔记。</p>
          </header>
          <List
            pagination={{ position: 'bottom', align: 'center' }}
            itemLayout="horizontal"
            dataSource={ArticleList}
            renderItem={(item) => (
              <List.Item>
                <time dateTime={dayjs(item.createTime).format('YYYY-MM-DD')}>{dayjs(item.createTime).format('YYYY-MM-DD')}</time>
                <List.Item.Meta title={<Link to={`/topic/${item.id}`}>{item.title}</Link>} description={item.description || '打开文章查看完整内容'} />
                <Link className="articleArrow" to={`/topic/${item.id}`} aria-label={`阅读文章：${item.title}`}>→</Link>
              </List.Item>
            )}
          />
        </Card>

        <div className={`aside`}>
          <Flex gap="small" vertical>
            <BlogAside></BlogAside>
            <BlogAside.PublicNotice></BlogAside.PublicNotice>
            <BlogAside.LabelCard></BlogAside.LabelCard>
          </Flex>
        </div>
      </div>
    </>
  )
}

export default Article
