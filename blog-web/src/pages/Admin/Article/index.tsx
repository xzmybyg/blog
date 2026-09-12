import { Button, Empty, Input, Select, Space, Table, Tag } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useEffect } from 'react'
import { getAdminArticleList, getArticleTopicList } from '@/apis'
import dayjs from 'dayjs'
import './index.scss'
import useUserStore from '@/store/user'

export default function Article() {
  const readOnly = useUserStore((state) => state.role === 'viewer')
  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '文章标题',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <a>{text}</a>,
      width: 200,
    },
    {
      title: '文章内容',
      dataIndex: 'article',
      key: 'article',
    },
    {
      title: '专题',
      dataIndex: 'topicName',
      key: 'topicName',
      render: (topicName) => topicName ? <Tag color="blue">{topicName}</Tag> : <span>—</span>,
    },
    {
      title: '标签',
      key: 'label',
      dataIndex: 'label',
      render: (tags: string[] | string | null) => {
        const normalizedTags = Array.isArray(tags)
          ? tags
          : String(tags ?? '').split(',').filter(Boolean)

        return (
          <Space size={[0, 4]} wrap>
            {normalizedTags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
          </Space>
        )
      },
    },
    {
      title: '封面',
      dataIndex: 'banner',
      key: 'banner',
      render: (banner) => <>{banner}</>,
    },
    {
      title: '置顶',
      dataIndex: 'topping',
      key: 'topping',
      render: (topping, record) => (
        <Switch
          disabled={readOnly}
          checkedChildren="是"
          unCheckedChildren="否"
          checked={topping}
          onChange={(checked) => {
            updateArticle({
              id: record.id,
              topping: checked,
            }).then(() => {
              setData((current) => current.map((item) => (item.id === record.id ? { ...item, topping: checked } : item)))
            })
          }}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time) => <>{dayjs(time).format('YYYY-MM-DD')}</>,
    },
    {
      title: '隐藏',
      dataIndex: 'hidden',
      key: 'hidden',
      render: (hidden, record) => (
        <Switch
          disabled={readOnly}
          checkedChildren="显示"
          unCheckedChildren="隐藏"
          checked={hidden}
          onChange={(checked) => {
            updateArticle({
              id: record.id,
              hidden: checked,
            }).then(() => {
              setData((current) => current.map((item) => (item.id === record.id ? { ...item, hidden: checked } : item)))
            })
          }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (record) => (
        readOnly ? <span>只读</span> : <Space>
          <Button onClick={() => showModal(record)}>编辑</Button>
          <Button onClick={() => delArticle(record.id)}>删除</Button>
        </Space>
      ),
    },
  ]
  const [data, setData] = useState<Article[]>([])
  const [keyword, setKeyword] = useState('')
  const [selectedLabelId, setSelectedLabelId] = useState<number>()
  const [selectedTopicId, setSelectedTopicId] = useState<number>()
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const loadArticles = useCallback(() => {
    setLoading(true)
    return getAdminArticleList()
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch(() => message.error('文章列表加载失败，请稍后重试'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void loadArticles()
  }, [loadArticles])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null)
  const [labelList, setLabelList] = useState<Label[]>([])
  const [topicList, setTopicList] = useState<ArticleTopic[]>([])
  const [saving, setSaving] = useState(false)

  const showModal = (article: Article) => {
    setCurrentArticle(article)

    setIsModalOpen(true)
  }

  const handleOk = async () => {
    if (!currentArticle) return
    setSaving(true)
    try {
      await updateArticle(currentArticle)
      await loadArticles()
      setIsModalOpen(false)
      message.success('文章已更新')
    } catch {
      message.error('文章更新失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const delArticle = (id: number) => {
    deleteArticle(id)
      .then(() => {
        setData((current) => current.filter((item) => item.id !== id))
        setPage(1)
        message.success('文章已删除')
      })
      .catch(() => message.error('文章删除失败，请稍后重试'))
  }

  useEffect(() => {
    getArticleFiles().then((res) => setArticleFileList(Array.isArray(res.data) ? res.data : []))
    getLabelList().then((res) => setLabelList(Array.isArray(res.data) ? res.data : []))
    getArticleTopicList()
      .then((res) => setTopicList(Array.isArray(res.data) ? res.data : []))
      .catch(() => message.error('专题列表加载失败'))
  }, [])

  const [articleFileList, setArticleFileList] = useState<string[]>([])

  const filteredData = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('zh-CN')
    return data.filter((article) => {
      const matchesTitle = !normalizedKeyword || article.title.toLocaleLowerCase('zh-CN').includes(normalizedKeyword)
      const matchesLabel = selectedLabelId === undefined || article.labelIds?.includes(selectedLabelId)
      const matchesTopic = selectedTopicId === undefined || article.topicId === selectedTopicId
      return matchesTitle && matchesLabel && matchesTopic
    })
  }, [data, keyword, selectedLabelId, selectedTopicId])

  const hasFilters = Boolean(keyword.trim()) || selectedLabelId !== undefined || selectedTopicId !== undefined

  const resetFilters = () => {
    setKeyword('')
    setSelectedLabelId(undefined)
    setSelectedTopicId(undefined)
    setPage(1)
  }

  return (
    <div>
      <div style={{ width: '100%', height: '100%' }}>
        <Table
          rowKey={(record) => record.id}
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={hasFilters ? '没有找到符合条件的文章' : '暂无文章'}
              >
                {hasFilters && <Button onClick={resetFilters}>清空筛选条件</Button>}
              </Empty>
            ),
          }}
          pagination={{
            current: page,
            pageSize: 10,
            total: filteredData.length,
            onChange: setPage,
          }}
          title={() => (
            <section className="admin-article-filters" aria-label="文章筛选">
              <label>
                <span>搜索文章</span>
                <Input
                  allowClear
                  prefix={<SearchOutlined aria-hidden="true" />}
                  placeholder="输入文章标题"
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value)
                    setPage(1)
                  }}
                />
              </label>
              <label>
                <span>按专题筛选</span>
                <Select
                  allowClear
                  aria-label="按专题筛选文章"
                  placeholder="全部专题"
                  value={selectedTopicId}
                  options={topicList.map((item) => ({ label: item.name, value: item.id }))}
                  onChange={(value) => {
                    setSelectedTopicId(value)
                    setPage(1)
                  }}
                />
              </label>
              <label>
                <span>按标签筛选</span>
                <Select
                  allowClear
                  aria-label="按标签筛选文章"
                  placeholder="全部标签"
                  value={selectedLabelId}
                  options={labelList.map((item) => ({ label: item.label, value: item.id }))}
                  onChange={(value) => {
                    setSelectedLabelId(value)
                    setPage(1)
                  }}
                />
              </label>
              <div className="admin-article-filters__summary" aria-live="polite">
                <span>{hasFilters ? `找到 ${filteredData.length} 篇文章` : `共 ${data.length} 篇文章`}</span>
                {hasFilters && <Button type="link" onClick={resetFilters}>清空条件</Button>}
              </div>
            </section>
          )}
          size="large"
          style={{ fontSize: '18px', lineHeight: '2' }}
        />
      </div>
      <Modal
        title="编辑文章"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{ loading: saving }}
        cancelButtonProps={{ disabled: saving }}
        closable={!saving}
        maskClosable={!saving}
        keyboard={!saving}
        okText="确定"
        cancelText="取消"
      >
        <Form labelCol={{ span: 4 }}>
          <Form.Item label="文章标题">
            <Input
              value={currentArticle?.title}
              onChange={(e) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  title: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="文章文件">
            <Select
              placeholder="新建文章"
              value={currentArticle?.article}
              options={articleFileList.map((item) => ({
                label: item,
                value: item,
              }))}
              onChange={(e) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  article: e,
                })
              }
            />
          </Form.Item>
          <Form.Item label="标签">
            <Select
              mode="multiple"
              placeholder="请选择标签"
              value={currentArticle?.labelIds}
              options={labelList.map((item) => ({ label: item.label, value: item.id }))}
              onChange={(value) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  labelIds: value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="专题">
            <Select
              allowClear
              placeholder="请选择专题（可选）"
              value={currentArticle?.topicId ?? undefined}
              options={topicList.map((item) => ({ label: item.name, value: item.id }))}
              onChange={(value) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  topicId: value ?? null,
                  topicOrder: value === undefined ? 0 : currentArticle?.topicOrder,
                })
              }
            />
          </Form.Item>
          <Form.Item label="文章描述">
            <Input.TextArea
              value={currentArticle?.description}
              onChange={(e) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  description: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="封面">
            <Input
              value={currentArticle?.banner}
              onChange={(e) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  banner: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="置顶">
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              checked={currentArticle?.topping}
              onChange={(checked) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  topping: checked,
                })
              }
            />
          </Form.Item>
          <Form.Item label="隐藏">
            <Switch
              checkedChildren="显示"
              unCheckedChildren="隐藏"
              checked={currentArticle?.hidden}
              onChange={(checked) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  hidden: checked,
                })
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
