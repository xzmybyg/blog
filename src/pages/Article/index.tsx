import { Timeline } from "antd";
import useStore from "@/store";

function Article() {
  // const { setTotal, setArticleList, articleList } = useStore();
  const [TimelineList, setTimelineList] = useState([]);
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
        let resData = res.data.map((item: any) => {
          return { ...item, children: item.title + item.createDate };
        });
        setTimelineList(resData);
        console.log(resData, "articleList");
      });
  }, []);

  return (
    <>
      <div className="Article">
        {TimelineList.length > 0 && (
          <Timeline mode="alternate" items={TimelineList} />
        )}
      </div>
    </>
  );
}

export default Article;
