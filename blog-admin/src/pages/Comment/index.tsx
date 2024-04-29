import dayjs from "dayjs";

export default function Comment() {
  const [commentList, setCommentList] = useState<CommentAdmin[]>([]);
  useEffect(() => {
    getCommentList().then((res) => {
      setCommentList(res.data);
      console.log(res.data);
    });
  }, []);

  const columns = [
    {
      title: "id",
      dataIndex: "comment_id",
      key: "id",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "文章id",
      dataIndex: "article_id",
      key: "article_id",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "文章标题",
      dataIndex: "comment_to_article_title",
      key: "comment_to_article_title",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "评论用户",
      dataIndex: "userName",
      key: "userName",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "评论内容",
      dataIndex: "content",
      key: "content",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "评论时间",
      dataIndex: "createTime",
      key: "createTime",
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
  const expandedRowRender = (record) => {
    const columns = [
      {
        title: "回复id",
        dataIndex: "reply_id",
        key: "reply_id",
        render: (text) => <a>{text}</a>,
      },
      {
        title: "回复用户",
        dataIndex: "userName",
        key: "userName",
        render: (text) => <a>{text}</a>,
      },
      {
        title: "回复内容",
        dataIndex: "content",
        key: "content",
        render: (text) => <a>{text}</a>,
      },
      {
        title: "回复时间",
        dataIndex: "createTime",
        key: "createTime",
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
      <Table
        rowKey={(record) => record.reply_id}
        columns={columns}
        dataSource={record.replyList}
        pagination={false}
      />
    );
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Table
        rowKey={(record) => record.comment_id}
        columns={columns}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => record.replyList.length > 0,
        }}
        dataSource={commentList}
        size="large"
        style={{ fontSize: "18px", lineHeight: "2" }}
      />
    </div>
  );
}
