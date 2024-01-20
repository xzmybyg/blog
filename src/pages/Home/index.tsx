import useStore from "@/store";
//api引入
import { getPageArticleList } from "@/apis";
//type引入
import type { CardProps } from "@/types";

import { default as ArticleCard } from "@/components/ArticleCard"
//样式引入
import Style from "./index.module.scss"
import useRequest from "@/hooks/useRequest"

const description = "本站使用react+ant Design搭建"

function Home() {
  const { aticleTotal } = useStore()
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const params = { page, pageSize }
  const { data: artList } = useRequest(getPageArticleList, params)

  const { homePage, articleWrap, aside } = Style

  return (
    <div className={`${homePage} pages`}>
      <Space className={articleWrap} direction="vertical">
        {artList?.map((item: CardProps, i: number) => {
          return (
            <ArticleCard
              key={item.id}
              id={item.id}
              title={item.title || description}
              addClassName={i % 2 == 1 ? "article-reverse" : ""}
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
          onChange={(page, _pageSize) => {
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
  )
}
export default Home;
