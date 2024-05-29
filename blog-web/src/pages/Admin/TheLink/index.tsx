import dayjs from 'dayjs'

export default function TheLink() {
  const [linkList, setLinkList] = useState<Link[]>([])
  useEffect(() => {
    getAllLinkList().then((res) => {
      setLinkList(res.data)
    })
  }, [])
  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <>{text}</>,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <>{text}</>,
    },
    {
      title: '链接',
      dataIndex: 'url',
      key: 'url',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      render: (state) => {
        let text, color
        if (state === 0) {
          text = '待审核'
          color = 'warning'
        } else if (state === 1) {
          text = '已通过'
          color = 'success'
        } else {
          text = '已拒绝'
          color = 'error'
        }

        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      render: (icon) => <>{icon}</>,
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      key: 'applyTime',
      render: (time) => <>{dayjs(time).format('YYYY-MM-DD')}</>,
    },
    {
      title: '操作',
      key: 'action',
      render: (record) => (
        <Space size="middle">
          <Button onClick={() => handleAdopt(record.id)}>通过</Button>
          <Button onClick={() => handleRefuse(record.id)}>拒绝</Button>
          <Button onClick={() => handleDeleteLink(record.id)} danger>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const handleAdopt = (id: number) => {
    updateLink({ id, state: 1 })
      .then(() => {
        message.success('通过')
        setLinkList(
          linkList.map((item) => {
            if (item.id === id) {
              item.state = 1
            }
            return item
          }),
        )
      })
      .catch(() => {
        message.error('操作失败')
      })
  }

  const handleRefuse = (id: number) => {
    updateLink({ id, state: 2 })
      .then(() => {
        message.success('已拒绝')
        setLinkList(
          linkList.map((item) => {
            if (item.id === id) {
              item.state = 0
            }
            return item
          }),
        )
      })
      .catch(() => {
        message.error('操作失败')
      })
  }

  const handleDeleteLink = (id: number) => {
    deleteLink(id)
      .then(() => {
        message.success('删除成功')
        setLinkList(linkList.filter((item) => item.id !== id))
      })
      .catch(() => {
        message.error('删除失败')
      })
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Table
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={linkList}
        size="large"
        style={{ fontSize: '18px', lineHeight: '2' }}
      />
    </div>
  )
}
