//api引入
import { DEFAULT_HOME_CONTENT, DEFAULT_HOME_CONTENT_ORDER, getHomeContent, getPageArticleList, type HomeContentSection } from '@/apis'
import type { ReactNode } from 'react'

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

  const heroSections: ReactNode[] = []
  let introFields: HomeContentSection[] = []
  const flushIntro = () => {
    if (!introFields.length) return
    heroSections.push(
      <p className={Style.intro} key={`intro-${heroSections.length}`}>
        {introFields.map((field) => {
          if (field === 'authorName') return <span key={field}>我是<em>{homeContent.authorName}</em>，</span>
          if (field === 'typedTexts') return <span key={field}><span className={typed} ref={el}></span>。</span>
          return <span key={field}>{homeContent.description}</span>
        })}
      </p>,
    )
    introFields = []
  }
  for (const field of homeContent.sectionOrder || DEFAULT_HOME_CONTENT_ORDER) {
    if (field === 'eyebrow' || field === 'title') {
      flushIntro()
      heroSections.push(field === 'eyebrow'
        ? <span className={Style.eyebrow} key={field}>{homeContent.eyebrow}</span>
        : <h1 id="home-title" style={{ whiteSpace: 'pre-line' }} key={field}>{homeContent.title}</h1>)
    } else {
      introFields.push(field)
    }
  }
  flushIntro()

  return (
    <div className={`${homePage} home-page`}>
      <section
        className={`${banerWrap}`}
        aria-labelledby="home-title"
        style={{ '--site-background': `url("${backgroundUrl}")` } as React.CSSProperties}
      >
        <div className={`${slogan}`}>
          {heroSections}
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
