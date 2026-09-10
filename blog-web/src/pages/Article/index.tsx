import dayjs from 'dayjs'
import { Button, Empty, Input, List, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { getAllArticleList, getArticleTopicList, getLabelList } from '@/apis'
import { Link } from 'react-router-dom'
import './index.scss'

function Article() {
  const [articleList, setArticleList] = useState<Article[]>([])
  const [labelList, setLabelList] = useState<Label[]>([])
  const [topicList, setTopicList] = useState<ArticleTopic[]>([])
  const [keyword, setKeyword] = useState('')
  const [selectedLabelId, setSelectedLabelId] = useState<number>()
  const [selectedTopicId, setSelectedTopicId] = useState<number>()
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    getAllArticleList()
      .then((res) => {
        if (!Array.isArray(res.data)) throw new Error('文章列表响应格式错误')
        setArticleList(res.data)
      })
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false))

    getLabelList()
      .then((res) => {
        if (!Array.isArray(res.data)) throw new Error('标签列表响应格式错误')
        setLabelList(res.data)
      })
      .catch(() => message.error('标签列表加载失败，暂时无法按标签筛选'))
    getArticleTopicList()
      .then((res) => {
        if (!Array.isArray(res.data)) throw new Error('专题列表响应格式错误')
        setTopicList(res.data)
      })
      .catch(() => message.error('专题列表加载失败，暂时无法按专题筛选'))
  }, [])

  const filteredArticles = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('zh-CN')
    return articleList.filter((article) => {
      const matchesTitle = !normalizedKeyword || article.title.toLocaleLowerCase('zh-CN').includes(normalizedKeyword)
      const matchesLabel = selectedLabelId === undefined || article.labelIds?.includes(selectedLabelId)
      const matchesTopic = selectedTopicId === undefined || article.topicId === selectedTopicId
      return matchesTitle && matchesLabel && matchesTopic
    })
  }, [articleList, keyword, selectedLabelId, selectedTopicId])

  const hasFilters = Boolean(keyword.trim()) || selectedLabelId !== undefined || selectedTopicId !== undefined

  const resetFilters = () => {
    setKeyword('')
    setSelectedLabelId(undefined)
    setSelectedTopicId(undefined)
    setPage(1)
  }

  return (
    <>
      <div className="Article pages">
        <Card className="listWrap">
          <header className="articlePageHeader">
            <span>WRITING ARCHIVE</span>
            <h1>文章归档</h1>
            <p>按时间浏览关于 React、TypeScript、工程化与产品体验的实践笔记。</p>
          </header>
          <section className="articleFilters" aria-label="文章筛选">
            <label>
              <span>搜索文章</span>
              <Input
                allowClear
                prefix={<SearchOutlined aria-hidden="true" />}
                placeholder="输入文章标题"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value)
                  setPage(1)
                }}
              />
            </label>
            <label>
              <span>按专题筛选</span>
              <Select
                allowClear
                aria-label="按专题筛选文章"
                placeholder="全部专题"
                value={selectedTopicId}
                options={topicList.map((item) => ({ label: item.name, value: item.id }))}
                onChange={(value) => {
                  setSelectedTopicId(value)
                  setPage(1)
                }}
              />
            </label>
            <label>
              <span>按标签筛选</span>
              <Select
                allowClear
                aria-label="按标签筛选文章"
                placeholder="全部标签"
                value={selectedLabelId}
                options={labelList.map((item) => ({ label: item.label, value: item.id }))}
                onChange={(value) => {
                  setSelectedLabelId(value)
                  setPage(1)
                }}
              />
            </label>
            <div className="articleFilters__summary" aria-live="polite">
              <span>{hasFilters ? `找到 ${filteredArticles.length} 篇文章` : `共 ${articleList.length} 篇文章`}</span>
              {hasFilters && <Button type="link" onClick={resetFilters}>清空条件</Button>}
            </div>
          </section>
          <List
            loading={loading}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={loadFailed ? '文章加载失败，请稍后刷新重试' : '没有找到符合条件的文章'}
                >
                  {!loadFailed && hasFilters && <Button onClick={resetFilters}>清空筛选条件</Button>}
                </Empty>
              ),
            }}
            pagination={filteredArticles.length > 0 ? {
              position: 'bottom',
              align: 'center',
              current: page,
              pageSize: 10,
              total: filteredArticles.length,
              onChange: setPage,
            } : false}
            itemLayout="horizontal"
            dataSource={filteredArticles}
            renderItem={(item) => (
              <List.Item>
                <time dateTime={dayjs(item.createTime).format('YYYY-MM-DD')}>{dayjs(item.createTime).format('YYYY-MM-DD')}</time>
                <List.Item.Meta
                  title={<Link to={`/topic/${item.id}`}>{item.title}</Link>}
                  description={(
                    <div className="articleArchiveMeta">
                      {item.topicName && <span>专题 · {item.topicName}</span>}
                      <p>{item.description || '打开文章查看完整内容'}</p>
                    </div>
                  )}
                />
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
