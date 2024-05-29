import useStore from '@/store'
//api引入
import { getPageArticleList } from '@/apis'

import { default as ArticleCard } from '@/components/ArticleCard'
//样式引入
import Style from './index.module.scss'
import useRequest from '@/hooks/useRequest'

const description = '本站使用React+Express搭建'

import { useTyped } from '@/hooks'
import { DownOutlined, GithubOutlined } from '@ant-design/icons'

function Home() {
  const { aticleTotal } = useStore()
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const params = { page, pageSize }
  const { data: artList } = useRequest(getPageArticleList, params)

  const { homePage, articleWrap, aside, banerWrap, typed, slogan, Social_links, icon_gitee, jump } = Style

  const el = useTyped(['一名前端开发工程师', 'A Web &lt;Developer /&gt;'], { loop: true })

  return (
    <div className={`${homePage}`}>
      <div className={`${banerWrap}`}>
        <div className={`${slogan}`}>
          <p>你好!&#128075; </p>
          <p>
            我是<em>心中没有白月光</em>，
          </p>
          <p>
            <span className={`${typed}`} ref={el}></span>
          </p>
          <p>欢迎来到我的博客。</p>
          <div className={`${Social_links}`}>
            <Button icon={<GithubOutlined />} />
            <Button icon={<i className={`iconfont icon-gitee ${icon_gitee}`} />} />
          </div>
        </div>
        <div className={`${jump}`}>
          <Button
            type="text"
            icon={<DownOutlined />}
            onClick={() => {
              window.location.hash = ''
              window.location.hash = 'articles'
            }}
          />
        </div>
      </div>
      <div id="articles" className={`pages`}>
        <Space className={articleWrap} direction="vertical">
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
              ></ArticleCard>
            )
          })}
          <Pagination
            defaultCurrent={1}
            current={page}
            defaultPageSize={pageSize}
            total={aticleTotal}
            onChange={(page) => {
              setPage(page)
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
