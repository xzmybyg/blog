import { Timeline } from "antd";
import useStore from "@/store";
import dayjs from "dayjs";

function Article() {
  const [TimelineList, setTimelineList] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const { aticleTotal } = useStore();

  useEffect(() => {
    axios
      .get("api/article/", {
        params: {
          page: 1,
          pageSize: aticleTotal,
        },
      })
      .then(res => {
        let resData = res.data.map((item: any) => {
          return {
            ...item,
            children: `${item.title} ${dayjs(item.createDate).format(
              "YYYY-MM-DD"
            )}`,
          };
        });
        setTimelineList(resData);
        console.log(resData, "articleList");
      });
  }, []);

  return (
    <>
      <div className="Article">
        {/* {TimelineList.length > 0 && (
          <Timeline mode="alternate" items={TimelineList} />
        )} */}
      </div>
    </>
  );
}

export default Article;
