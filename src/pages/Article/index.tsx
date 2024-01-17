import dayjs from "dayjs";
import { List } from "antd";
import { getAllArticleList } from "@/apis";
import type { Article } from "@/types";

function Article() {
  const [ArticleList, setArticleList] = useState<Article[]>([]);

  useEffect(() => {
    getAllArticleList().then(res => {
      setArticleList(res.data)
    })
  }, [])

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
                  description={dayjs(item.createTime).format("YYYY-MM-DD")}
                />
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

export default Article;
