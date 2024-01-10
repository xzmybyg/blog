import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

interface DataType {
  key: string;
  id: number;
  title: string;
  article: string;
  banner: string;
  topping: boolean;
  createDate: string;
  hidden: boolean;
  tags: string[];
}

export default function AdminTopic() {
  const columns: ColumnsType<DataType> = [
    {
      title: "id",
      dataIndex: "id",
      key: "id",
      render: text => <a>{text}</a>,
    },
    {
      title: "文章标题",
      dataIndex: "title",
      key: "title",
      render: text => <a>{text}</a>,
      width: 200,
    },
    {
      title: "文件名",
      dataIndex: "article",
      key: "article",
    },
    {
      title: "label",
      key: "label",
      dataIndex: "label",
      render: tags => (
        <>
          {tags.map((tag: string) => {
            let color = tag.length > 5 ? "geekblue" : "green";
            if (tag === "loser") {
              color = "volcano";
            }
            return (
              <Tag color={color} key={tag}>
                {tag}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "封面",
      dataIndex: "banner",
      key: "banner",
      render: banner => <>{banner}</>,
    },
    {
      title: "置顶",
      dataIndex: "topping",
      key: "topping",
      render: topping => <>{topping ? "是" : "否"}</>,
    },
    {
      title: "创建时间",
      dataIndex: "createDate",
      key: "create_time",
      render: time => <>{dayjs(time).format("YYYY-MM-DD")}</>,
    },
    {
      title: "隐藏",
      dataIndex: "hidden",
      key: "hidden",
      render: hidden => <>{hidden ? "是" : "否"}</>,
    },
    {
      title: "操作",
      key: "action",
      render: (text, record) => (
        <Space>
          <Button onClick={() => setArticle(record)}>编辑</Button>
          <Button onClick={() => deleteArticle(record)}>删除</Button>
        </Space>
      ),
    },
  ];
  const deleteArticle = (record: DataType) => {
    delArticle(record.id).then(res => {
      console.log(res.data);
    });
  };
  const setArticle = (record: DataType) => {
    editArticle(record.id).then(res => {
      console.log(res.data);
    });
  }
  const [data, setData] = useState([]);

  useEffect(() => {
    getAllArticleList().then(res => {
      console.log(res.data);
      setData(res.data);
    });
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Table
        rowKey={record => record.id}
        columns={columns}
        dataSource={data}
        size="large"
        style={{ fontSize: "18px", lineHeight: "2" }}
      />
    </div>
  );
}
