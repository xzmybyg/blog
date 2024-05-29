import dayjs from 'dayjs'

export default function Comment() {
  const [commentList, setCommentList] = useState<CommentAdmin[]>([])
  useEffect(() => {
    getCommentList().then((res) => {
      setCommentList(res.data)
    })
  }, [])

  const columns = [
    {
      title: 'id',
      dataIndex: 'comment_id',
      key: 'id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '文章id',
      dataIndex: 'article_id',
      key: 'article_id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '文章标题',
      dataIndex: 'comment_to_article_title',
      key: 'comment_to_article_title',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '评论用户',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      key: 'content',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '评论时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time) => <>{dayjs(time).format('YYYY-MM-DD')}</>,
    },
    {
      title: '操作',
      key: 'action',
      render: (record) => (
        <Space size="middle">
          <Button
            onClick={() => {
              handleDeleteComment(record.comment_id)
            }}
            danger
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]
  const expandedRowRender = (record) => {
    const columns = [
      {
        title: '回复id',
        dataIndex: 'reply_id',
        key: 'reply_id',
        render: (text) => <a>{text}</a>,
      },
      {
        title: '回复用户',
        dataIndex: 'username',
        key: 'username',
        render: (text) => <a>{text}</a>,
      },
      {
        title: '回复内容',
        dataIndex: 'content',
        key: 'content',
        render: (text) => <a>{text}</a>,
      },
      {
        title: '回复时间',
        dataIndex: 'createTime',
        key: 'createTime',
        render: (time) => <>{dayjs(time).format('YYYY-MM-DD')}</>,
      },
      {
        title: '操作',
        key: 'action',
        render: (record) => (
          <Space size="middle">
            <Button
              onClick={() => {
                handleDeleteReply(record.reply_id)
              }}
              danger
            >
              删除
            </Button>
          </Space>
        ),
      },
    ]
    return (
      <Table rowKey={(record) => record.reply_id} columns={columns} dataSource={record.replyList} pagination={false} />
    )
  }

  const handleDeleteComment = (id) => {
    deleteComment(id).then(() => {
      setCommentList(commentList.filter((item) => item.comment_id !== id))
    })
  }

  const handleDeleteReply = (id) => {
    deleteReply(id).then(() => {
      setCommentList(
        commentList.map((item) => {
          item.replyList = item.replyList.filter((reply) => reply.reply_id !== id)
          return item
        }),
      )
    })
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Table
        rowKey={(record) => record.comment_id}
        columns={columns}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => record.replyList.length > 0,
        }}
        dataSource={commentList}
        size="large"
        style={{ fontSize: '18px', lineHeight: '2' }}
      />
    </div>
  )
}
