import useStore from "@/store";
//api引入
import { getPageArticleList } from "@/apis";
//type引入
import type { CardProps } from "@/types";

import MoemoArticleCard from "@/components/ArticleCard";
//样式引入
import Style from "./index.module.scss";

const description = "本站使用react+ant Design搭建";

function Home() {
  const { aticleTotal } = useStore();
  const [artList, setArtLIst] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  useEffect(() => {
    getPageArticleList({ page, pageSize }).then(res => {
      setArtLIst(res.data);
      console.log(res.data);
    });
  }, [page, pageSize]);

  const { homePage, articleWrap, aside } = Style;

  return (
    <div className={`${homePage} pages`}>
      <Space className={articleWrap} direction="vertical">
        {artList.map((item: CardProps, i) => {
          return (
            <Link key={item.id} to={`/topic/${item.id}`}>
              <MoemoArticleCard
                key={item.id}
                id={item.id}
                title={item.title || description}
                addClassName={i % 2 == 1 ? "article-reverse" : ""}
                topping={item.topping}
                label={item.label}
                description={item.description}
                createDate={item.createDate}
              ></MoemoArticleCard>
            </Link>
          );
        })}
        <Pagination
          current={page}
          defaultPageSize={pageSize}
          total={aticleTotal}
          onChange={(page, _pageSize) => {
            setPage(page);
          }}
        />
      </Space>
      <div className={`aside ${aside}`}>
        <Flex gap="small" vertical>
          <Introduction></Introduction>
          <PublicNotice></PublicNotice>
          <Website></Website>
        </Flex>
      </div>
    </div>
  );
}
export default Home;
