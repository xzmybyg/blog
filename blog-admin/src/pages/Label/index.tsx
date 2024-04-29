import dayjs from "dayjs";

export default function Label() {
  const [labelList, setLabelList] = useState<Label[]>([]);
  useEffect(() => {
    getLabelList().then((res) => {
      setLabelList(res.data);
    });
  }, []);

  const columns = [
    {
      title: "id",
      dataIndex: "id",
      key: "id",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "标签名",
      dataIndex: "label",
      key: "label",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "颜色",
      dataIndex: "color",
      key: "color",
      render: (color) => (
        <span style={{ backgroundColor: color, color: "#fff" }}>{color}</span>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createDate",
      key: "create_time",
      render: (time) => <>{dayjs(time).format("YYYY-MM-DD")}</>,
    },
    {
      title: "操作",
      key: "action",
      render: () => (
        <Space size="middle">
          <a>编辑</a>
          <a>删除</a>
        </Space>
      ),
    },
  ];
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Table
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={labelList}
        size="large"
        style={{ fontSize: "18px", lineHeight: "2" }}
      />
    </div>
  );
}
