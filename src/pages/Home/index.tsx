import useStore from "@/store";
//api引入
import { getPageArticleList } from "@/apis";
//type引入
import type { CardProps } from "@/types";
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

  return (
    <div className={`${Style["homePage"]} 'pages'`}>
      <Space className={Style["artcicle-wrap"]} direction="vertical">
        {artList.map((item: CardProps, i) => {
          return (
            <Link key={item.id} to={`/topic/${item.id}`}>
              <ArticleCard
                addClassName={i % 2 == 1 ? "article-reverse" : ""}
                key={item.title}
                id={item.id}
                title={item.title || description}
                topping={item.topping}
                label={item.label}
                description={item.description}
              ></ArticleCard>
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
      <div className={Style.aside}>
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
