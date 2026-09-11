//api引入
import { DEFAULT_HOME_CONTENT, getHomeContent, getPageArticleList } from '@/apis'

import { default as ArticleCard } from '@/components/ArticleCard'
//样式引入
import Style from './index.module.scss'
import useRequest from '@/hooks/useRequest'
import useSiteBackground from '@/hooks/useSiteBackground'

const description = '本站使用React+Express搭建'

import { useTyped } from '@/hooks'
import { ArrowDownOutlined, GithubOutlined, ReadOutlined } from '@ant-design/icons'

function Home() {
  const backgroundUrl = useSiteBackground('home')
  const [homeContent, setHomeContent] = useState(DEFAULT_HOME_CONTENT)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const params = { page, pageSize }
  const { data: articlePage } = useRequest(getPageArticleList, params)
  const artList = articlePage?.list ?? []
  const articleTotal = articlePage?.total ?? 0

  const { homePage, articleWrap, aside, banerWrap, typed, slogan, Social_links, icon_gitee, jump } = Style

  const el = useTyped(homeContent.typedTexts, { loop: true, contentType: 'null' })

  useEffect(() => {
    getHomeContent()
      .then((response) => setHomeContent(response.data))
      .catch(() => setHomeContent(DEFAULT_HOME_CONTENT))
  }, [])

  return (
    <div className={`${homePage} home-page`}>
      <section
        className={`${banerWrap}`}
        aria-labelledby="home-title"
        style={{ '--site-background': `url("${backgroundUrl}")` } as React.CSSProperties}
      >
        <div className={`${slogan}`}>
          <span className={Style.eyebrow}>{homeContent.eyebrow}</span>
          <h1 id="home-title" style={{ whiteSpace: 'pre-line' }}>{homeContent.title}</h1>
          <p className={Style.intro}>
            我是<em>{homeContent.authorName}</em>，<span className={`${typed}`} ref={el}></span>。
            {homeContent.description}
          </p>
          <div className={`${Social_links}`}>
            <Button href="#articles" type="primary" icon={<ReadOutlined />}>阅读最新文章</Button>
            <Button href="https://github.com/xzmybyg" target="_blank" rel="noreferrer" aria-label="在新标签页打开 GitHub" icon={<GithubOutlined />}>GitHub</Button>
            <span className={icon_gitee} aria-hidden="true" />
          </div>
        </div>
        <div className={`${jump}`}>
          <Button
            type="text"
            aria-label="滚动到最新文章"
            icon={<ArrowDownOutlined />}
            onClick={() => {
              document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' })
            }}
          />
        </div>
      </section>
      <div id="articles" className={`pages`}>
        <Space className={articleWrap} direction="vertical">
          <header className={Style.sectionHeader}>
            <div><span className={Style.eyebrow}>LATEST WRITING</span><h2>最近更新</h2></div>
            <span className={Style.articleCount}>共 {articleTotal} 篇</span>
          </header>
          {artList?.map((item: CardProps, i: number) => {
            return (
              <ArticleCard
                key={item.id}
                id={item.id}
                title={item.title || description}
                addClassName={i % 2 == 1 ? 'article-reverse' : ''}
                topping={item.topping}
                label={item.label}
                description={item.description}
                createTime={item.createTime}
                banner={item.banner}
              ></ArticleCard>
            )
          })}
          <Pagination
            defaultCurrent={1}
            current={page}
            defaultPageSize={pageSize}
            total={articleTotal}
            onChange={(page) => {
              setPage(page)
              document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' })
            }}
          />
        </Space>
        <div className={`aside ${aside}`}>
          <Flex gap="small" vertical>
            <BlogAside></BlogAside>
            <BlogAside.PublicNotice></BlogAside.PublicNotice>
            <BlogAside.Website></BlogAside.Website>
          </Flex>
        </div>
      </div>
    </div>
  )
}
export default Home
