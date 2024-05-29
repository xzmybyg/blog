import { Select } from "antd";
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
      dataIndex: "username",
      key: "username",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      render: (role) => <>{role}</>,
    },
    {
      title: "评论权限",
      dataIndex: "commentLimit",
      key: "commentLimit",
      render: (commentLimit, record) => (
        <Switch
          checkedChildren="是"
          unCheckedChildren="否"
          checked={commentLimit}
          onChange={(checked) => {
            updateUser({
              id: record.id,
              commentLimit: checked,
            }).then((res) => {
              console.log(res);

              setUserList(
                userList.map((item) =>
                  item.id === record.id
                    ? { ...item, commentLimit: checked }
                    : item
                )
              );
            });
          }}
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
      render: (record) => (
        <Space size="middle">
          <Button onClick={() => handleEditUser(record)}>编辑</Button>
          <Button onClick={() => handleDeleteUser(record.id)} danger>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const showModal = (User: User) => {
    setCurrentUser(User);

    setIsModalOpen(true);
  };

  const handleOk = () => {
    updateUser(currentUser).then(() => {
      setUserList(
        userList.map((item) =>
          item.id === currentUser?.id ? { ...item, ...currentUser } : item
        )
      );
    });

    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleEditUser = (User: User) => {
    showModal(User);
  };

  const handleDeleteUser = (id: number) => {
    deleteUser(id).then(() => {
      setUserList(userList.filter((item) => item.id !== id));
    });
  };

  return (
    <div>
      <div style={{ width: "100%", height: "100%" }}>
        <Table
          rowKey={(record) => record.id || record.username}
          columns={columns}
          dataSource={userList}
          size="large"
          style={{ fontSize: "18px", lineHeight: "2" }}
        />
      </div>

      <Modal
        title="编辑文章"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
      >
        <Form labelCol={{ span: 4 }}>
          <Form.Item label="用户名">
            <Input value={currentUser?.username} disabled />
          </Form.Item>
          <Form.Item label="昵称">
            <Input
              value={currentUser?.nickname}
              onChange={(e) =>
                setCurrentUser({
                  ...(currentUser as User),
                  nickname: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="角色">
            <Select
              value={currentUser?.role}
              onChange={(value) =>
                setCurrentUser({
                  ...(currentUser as User),
                  role: value,
                })
              }
            >
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="邮箱">
            <Input
              value={currentUser?.email}
              onChange={(e) =>
                setCurrentUser({
                  ...(currentUser as User),
                  email: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="头像">
            <Input
              value={currentUser?.avatar}
              onChange={(e) =>
                setCurrentUser({
                  ...(currentUser as User),
                  avatar: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="评论权限">
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              defaultChecked={currentUser?.commentLimit}
              onChange={(checked) =>
                setCurrentUser({
                  ...(currentUser as User),
                  commentLimit: checked,
                })
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
