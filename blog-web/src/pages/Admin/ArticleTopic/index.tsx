import { Button, Empty, Form, Input, Modal, Space, Table, message } from 'antd'
import dayjs from 'dayjs'
import { addArticleTopic, deleteArticleTopic, getArticleTopicList, updateArticleTopic } from '@/apis'
import './index.scss'

const emptyTopic = { id: 0, name: '', description: '' }

export default function ArticleTopicAdmin() {
  const [topics, setTopics] = useState<ArticleTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingTopic, setEditingTopic] = useState<ArticleTopic | null>(null)

  const loadTopics = useCallback(() => {
    setLoading(true)
    return getArticleTopicList()
      .then((response) => setTopics(response.data))
      .catch(() => message.error('专题列表加载失败，请稍后重试'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void loadTopics()
  }, [loadTopics])

  const saveTopic = async () => {
    if (!editingTopic?.name.trim()) {
      message.error('请输入专题名称')
      return
    }
    setSaving(true)
    try {
      if (editingTopic.id) {
        await updateArticleTopic({
          id: editingTopic.id,
          name: editingTopic.name.trim(),
          description: editingTopic.description?.trim(),
        })
        message.success('专题已更新')
      } else {
        await addArticleTopic({
          name: editingTopic.name.trim(),
          description: editingTopic.description?.trim(),
        })
        message.success('专题已创建')
      }
      await loadTopics()
      setEditingTopic(null)
    } catch (error: any) {
      message.error(error.response?.data?.message || '专题保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const removeTopic = (topic: ArticleTopic) => {
    Modal.confirm({
      title: `删除专题“${topic.name}”？`,
      content: '未关联文章的专题将被永久删除，此操作无法撤销。',
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteArticleTopic(topic.id)
          setTopics((current) => current.filter((item) => item.id !== topic.id))
          message.success('专题已删除')
        } catch (error: any) {
          message.error(error.response?.data?.message || '专题删除失败')
          throw error
        }
      },
    })
  }

  const columns = [
    { title: '专题名称', dataIndex: 'name', key: 'name' },
    { title: '说明', dataIndex: 'description', key: 'description', render: (value) => value || '—' },
    { title: '文章数', dataIndex: 'articleCount', key: 'articleCount', width: 100 },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 140, render: (value) => dayjs(value).format('YYYY-MM-DD') },
    {
      title: '操作',
      key: 'action',
      width: 170,
      render: (_value, record: ArticleTopic) => (
        <Space>
          <Button onClick={() => setEditingTopic({ ...record })}>编辑</Button>
          <Button danger disabled={Boolean(record.articleCount)} onClick={() => removeTopic(record)}>删除</Button>
        </Space>
      ),
    },
  ]

  return (
    <section className="article-topic-admin">
      <header className="article-topic-admin__header">
        <div>
          <span>ARTICLE TOPICS / 内容组织</span>
          <h1>专题管理</h1>
          <p>专题用于组织一组相关文章，每篇文章最多属于一个专题。</p>
        </div>
        <Button
          className="article-topic-admin__create-button"
          type="primary"
          onClick={() => setEditingTopic({ ...emptyTopic })}
        >
          新建专题
        </Button>
      </header>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={topics}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无专题" /> }}
      />
      <Modal
        title={editingTopic?.id ? '编辑专题' : '新建专题'}
        open={Boolean(editingTopic)}
        okText={editingTopic?.id ? '保存修改' : '创建专题'}
        cancelText="取消"
        okButtonProps={{ loading: saving }}
        cancelButtonProps={{ disabled: saving }}
        closable={!saving}
        maskClosable={!saving}
        keyboard={!saving}
        onOk={saveTopic}
        onCancel={() => setEditingTopic(null)}
      >
        <Form layout="vertical">
          <Form.Item label="专题名称" required>
            <Input
              autoFocus
              maxLength={64}
              showCount
              placeholder="例如：React 工程实践"
              value={editingTopic?.name}
              onChange={(event) => setEditingTopic((current) => current ? { ...current, name: event.target.value } : current)}
            />
          </Form.Item>
          <Form.Item label="专题说明">
            <Input.TextArea
              rows={4}
              maxLength={255}
              showCount
              placeholder="说明该专题收录的内容"
              value={editingTopic?.description}
              onChange={(event) => setEditingTopic((current) => current ? { ...current, description: event.target.value } : current)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  )
}
