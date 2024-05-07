import dayjs from "dayjs";

export default function User() {
  const [userList, setUserList] = useState<User[]>([]);
  useEffect(() => {
    getUserList().then((res) => {
      setUserList(res.data);
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
      title: "用户名",
      dataIndex: "userName",
      key: "username",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      render: (role) => <>{role === 1 ? "管理员" : "普通用户"}</>,
    },
    {
      title: "评论权限",
      dataIndex: "commentLimit",
      key: "commentLimit",
      render: (commentLimit) => (
        <Switch
          checkedChildren="是"
          unCheckedChildren="否"
          defaultChecked={commentLimit}
        />
      ),
    },
    {
      title: "昵称",
      dataIndex: "nickname",
      key: "nickname",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "头像",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar) => <Avatar src={avatar} />,
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "创建时间",
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
    <div style={{ width: "100%", height: "100%" }}>
      <Table
        rowKey={(record) => record.id || record.username}
        columns={columns}
        dataSource={userList}
        size="large"
        style={{ fontSize: "18px", lineHeight: "2" }}
      />
    </div>
  );
}
