import HomeStyle from "./Homepage.module.scss";
import CardProps from "@/@types/CardProps";
import useStore from "@/store";

const description = "本站使用react+ant Design搭建";
/**
 * @componet 首页组件
 */
function Home() {
  const { aticleTotal } = useStore();
  const [artList, setArtLIst] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  useEffect(() => {
    axios
      .get("/api/article/", {
        params: {
          page,
          pageSize,
        },
      })
      .then(res => {
        setArtLIst(res.data);
      });
  }, [page, pageSize]);
  return (
    <div className={`${HomeStyle["homePage"]} 'pages'`}>
      <Space className={HomeStyle["artcicle-wrap"]} direction="vertical">
        {artList.map((item: CardProps, i) => {
          return (
            <Link key={item.title} to={`/topic/${item.ID}`}>
              <ArticleCard
                addClassName={i % 2 == 1 ? "article-reverse" : ""}
                key={item.title}
                ID={item.ID}
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
      <div className={HomeStyle.aside}>
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
