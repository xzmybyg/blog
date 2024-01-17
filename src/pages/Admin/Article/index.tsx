import { Switch } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

type DataType = {
  key: string
  id: number
  title: string
  article: string
  banner: string
  topping: boolean
  createTime: string
  hidden: boolean
  tags: string[]
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
            let color = tag.length > 5 ? "geekblue" : "green"
            if (tag === "loser") {
              color = "volcano"
            }
            return (
              <Tag color={color} key={tag}>
                {tag}
              </Tag>
            )
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
      // render: topping => <>{topping ? "是" : "否"}</>,
      render: (topping, record) => (
        <Switch
          checkedChildren="开启"
          unCheckedChildren="关闭"
          checked={topping}
          onChange={(checked: boolean) => {
            record.topping = checked
            setData([...data, record])
          }}
        />
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "create_time",
      render: time => <>{dayjs(time).format("YYYY-MM-DD")}</>,
    },
    {
      title: "隐藏",
      dataIndex: "hidden",
      key: "hidden",
      // render: hidden => <>{hidden ? "是" : "否"}</>,
      render: (hidden, record) => (
        <Switch
          checkedChildren="开启"
          unCheckedChildren="关闭"
          checked={hidden}
          onChange={(checked: boolean) => {
            record.hidden = checked
            setData([...data, record])
          }}
        />
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (text, record) => (
        <Space>
          <Button onClick={() => setArticle(record)}>编辑</Button>
          <Button onClick={() => delArticle(record)}>删除</Button>
        </Space>
      ),
    },
  ]
  const delArticle = (record: DataType) => {
    deleteArticle(record.id).then(res => {
      console.log(res.data);
    });
  };
  const setArticle = (record: DataType) => {
    editArticle(record.id).then(res => {
      console.log(res.data);
    });
  };
  const [data, setData] = useState<DataType[] | never>([]);

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
