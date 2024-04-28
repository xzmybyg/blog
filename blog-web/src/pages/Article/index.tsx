import dayjs from "dayjs";
import { List } from "antd";
import { getAllArticleList } from "@/apis";

function Article() {
  const [ArticleList, setArticleList] = useState<Article[]>([]);
  const navigate = useNavigate()

  const routerPush = (id: number) => {
    navigate(`/topic/${id}`)
  }

  useEffect(() => {
    getAllArticleList().then(res => {
      console.log(res.data)

      setArticleList(res.data)
    })
  }, [])

  return (
    <>
      <div className="Article pages">
        <Card className="listWrap">
          <List
            pagination={{ position: "bottom", align: "center" }}
            itemLayout="horizontal"
            dataSource={ArticleList}
            renderItem={item => (
              <List.Item onClick={() => routerPush(item.id)}>
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
