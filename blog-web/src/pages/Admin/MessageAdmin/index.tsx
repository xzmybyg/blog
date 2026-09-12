import dayjs from 'dayjs'
import useUserStore from '@/store/user'

export default function MessageAdmin() {
  const readOnly = useUserStore((state) => state.role === 'viewer')
  const [messageList, setMessageList] = useState<Message[]>([])
  useEffect(() => {
    getMessageList().then((res) => {
      setMessageList(res.data)
    })
  }, [])

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '用户 ID',
      dataIndex: 'user_id',
      key: 'user_id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (username) => username || '用户已注销',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'create_time',
      render: (time) => <>{dayjs(time).format('YYYY-MM-DD')}</>,
    },
    {
      title: '操作',
      key: 'action',
      render: (record) => (
        readOnly ? <span>只读</span> : <Space size="middle">
          <Button onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ]

  const handleDelete = (id) => {
    deleteMessage(id).then(() => {
      setMessageList(messageList.filter((item) => item.id !== id))
    })
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Table
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={messageList}
        size="large"
        style={{ fontSize: '18px', lineHeight: '2' }}
      />
    </div>
  )
}
