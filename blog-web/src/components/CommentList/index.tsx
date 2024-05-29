import { UserOutlined } from '@ant-design/icons'
import { Avatar } from 'antd'
import dayjs from 'dayjs'
import './index.scss'
import useUserStore from '@/store/user'

const { TextArea } = Input

function CommentList({ data, onDataUpdate }: { data: any; onDataUpdate: () => void }) {
  const { id: user_id } = useUserStore()
  const {
    comment_id: reply_comment_id,
    user_id: reply_user_id,
    nickname,
    username,
    avatar,
    content,
    createTime,
    replyList,
  } = data

  const [isReplying, setIsReplying] = useState(false)
  const handleReplyClick = () => {
    setIsReplying(true)
  }
  const cancelReply = () => {
    setIsReplying(false)
  }

  const handleReply = (values: any) => {
    if (!user_id) {
      message.error('请先登录')
      return
    }

    const params = { ...values, user_id, reply_comment_id, reply_user_id }
    addReply(params).then(() => {
      message.success('回复成功')
      onDataUpdate()
    })
  }

  return (
    <div>
      <div className="CommentWrap">
        <Avatar className="avatar" size="large" src={avatar} icon={avatar ? null : <UserOutlined />} />
        <div className="contentMain">
          <div className="username">
            {nickname || username}
            <span className="date">{dayjs(createTime).format('YYYY-MM-DD HH:mm')}</span>
            <span style={{ marginLeft: 15, color: 'blue' }} onClick={handleReplyClick}>
              回复
            </span>
          </div>
          <div className="content">{content}</div>
          {isReplying && (
            <Form onFinish={handleReply}>
              <Form.Item name="content">
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" onClick={cancelReply}>
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit">
                    提交评论
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
          <div className="replyWrap">
            {replyList.map((item: any) => (
              <MoemoReply item={{ ...item, reply_comment_id }} key={item.reply_id} onDataUpdate={onDataUpdate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Reply({ item, onDataUpdate }: { item: any; onDataUpdate: () => void }) {
  const { id: user_id } = useUserStore()
  const {
    user_id: reply_user_id,
    reply_id,
    nickname,
    username,
    avatar,
    content,
    createTime,
    reply_to_username,
    reply_to_nickname,
    reply_comment_id,
  } = item
  const [isReplying, setIsReplying] = useState(false)
  const handleReplyClick = () => {
    setIsReplying(true)
  }
  const cancelReply = () => {
    setIsReplying(false)
  }
  const handleReply = (values: any) => {
    if (!user_id) {
      message.error('请先登录')
      return
    }

    const params = { ...values, user_id, reply_comment_id, reply_user_id }
    addReply(params).then(() => {
      message.success('回复成功')
      onDataUpdate()
    })
  }
  return (
    <div>
      <div className="replyItem" key={reply_id}>
        <Avatar className="avatar" size="large" src={avatar} icon={avatar ? null : <UserOutlined />} />
        <div>
          <div className="username">
            {nickname || username}
            <span className="date">{dayjs(createTime).format('YYYY-MM-DD HH:mm')}</span>
            <span style={{ marginLeft: 15, color: 'blue' }} onClick={handleReplyClick}>
              回复
            </span>
          </div>
          <div className="content">
            <span style={{ marginRight: 10, color: 'blue' }}>{`@${reply_to_nickname || reply_to_username}`}</span>
            {` ${content}`}
          </div>
        </div>
      </div>
      {isReplying && (
        <Form onFinish={handleReply}>
          <Form.Item name="content">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={cancelReply}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                提交评论
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </div>
  )
}

const MoemoCommentList = memo(CommentList)
const MoemoReply = memo(Reply)

export default MoemoCommentList
