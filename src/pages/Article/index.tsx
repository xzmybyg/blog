import dayjs from "dayjs";
import { List } from "antd";
import { getAllArticleList } from "@/apis";
import type { Article } from "@/types";

function Article() {
  const [ArticleList, setArticleList] = useState<Article[]>([]);

  useEffect(() => {
    getAllArticleList().then(res => {
      console.log(res.data, "articleList");
      setArticleList(res.data);
    });
  }, []);

  return (
    <>
      <div className="Article pages">
        <Card style={{ width: "50vw" }} className="listWrap">
          <List
            pagination={{ position: "bottom", align: "center" }}
            itemLayout="horizontal"
            dataSource={ArticleList}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={<a>{item.title}</a>}
                  description={dayjs(item.createDate).format("YYYY-MM-DD")}
                />
              </List.Item>
            )}
          />
        </Card>

        <div className={`aside`}>
          <Flex gap="small" vertical>
            <Introduction></Introduction>
            {/* <PublicNotice></PublicNotice> */}
            <LabelCard></LabelCard>
          </Flex>
        </div>
      </div>
    </>
  );
}

export default Article;
