import dayjs from "dayjs";

export default function TheLink() {
  const [linkList, setLinkList] = useState<Link[]>([]);
  useEffect(() => {
    getLinkList().then((res) => {
      setLinkList(res.data);
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
      title: "标题",
      dataIndex: "title",
      key: "title",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "链接",
      dataIndex: "url",
      key: "url",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "状态",
      dataIndex: "state",
      key: "state",
      render: (state) => <>{state === 1 ? "通过" : "待审核"}</>,
    },
    {
      title: "描述",
      dataIndex: "desc",
      key: "desc",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "图标",
      dataIndex: "icon",
      key: "icon",
      render: (icon) => <>{icon}</>,
    },
    {
      title: "申请时间",
      dataIndex: "applyTime",
      key: "applyTime",
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
        dataSource={linkList}
        size="large"
        style={{ fontSize: "18px", lineHeight: "2" }}
      />
    </div>
  );
}
