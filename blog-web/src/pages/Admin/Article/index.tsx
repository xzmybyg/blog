import MdEditor from 'for-editor'
import { Alert, Button, Empty, Input, Modal, Select, Space, Table, Tabs, Tag, Upload } from 'antd'
import type { UploadProps } from 'antd'
import { FileMarkdownOutlined, InboxOutlined, SearchOutlined } from '@ant-design/icons'
import { useEffect } from 'react'
import { getAdminArticleList, getArticleContent, getArticleTopicList, uploadArticleFile } from '@/apis'
import dayjs from 'dayjs'
import './index.scss'
import useUserStore from '@/store/user'
import DefaultCoverManager from './DefaultCoverManager'
import { bundledArticleCover, resolveArticleCover } from '@/utils/articleCover'

const MAX_MARKDOWN_SIZE = 2 * 1024 * 1024

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
      render: (banner) => <Tag color={banner ? 'blue' : 'default'}>{banner ? '单独封面' : '默认封面'}</Tag>,
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
  const [markdown, setMarkdown] = useState('')
  const [contentLoading, setContentLoading] = useState(false)
  const [selectedMarkdownFile, setSelectedMarkdownFile] = useState('')
  const [useCustomCover, setUseCustomCover] = useState(false)

  const loadArticleContent = async (articleFile: string) => {
    setContentLoading(true)
    try {
      const response = await getArticleContent(articleFile)
      setMarkdown(response.data)
    } catch {
      setMarkdown('')
      message.error('文章正文加载失败，请稍后重试')
    } finally {
      setContentLoading(false)
    }
  }

  const showModal = (article: Article) => {
    setCurrentArticle(article)
    setUseCustomCover(Boolean(article.banner?.trim() && article.banner !== '404'))
    setMarkdown('')
    setSelectedMarkdownFile('')
    setIsModalOpen(true)
    if (article.article) void loadArticleContent(article.article)
  }

  const handleOk = async () => {
    if (!currentArticle) return
    if (!currentArticle.title.trim()) {
      message.error('请输入文章标题')
      return
    }
    if (!currentArticle.article?.trim()) {
      message.error('请选择文章文件')
      return
    }
    if (!markdown.trim()) {
      message.error('文章正文不能为空')
      return
    }
    setSaving(true)
    try {
      await uploadArticleFile({ title: currentArticle.article, content: markdown })
      await updateArticle({ ...currentArticle, banner: currentArticle.banner?.trim() || '' })
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
    if (saving) return
    setIsModalOpen(false)
  }

  const readMarkdownFile = async (file: File) => {
    try {
      setMarkdown(await file.text())
      setSelectedMarkdownFile(file.name)
      message.success(`已读取 ${file.name}，保存后将替换当前正文`)
    } catch {
      message.error('文件读取失败，请确认文件编码为 UTF-8')
    }
  }

  const beforeMarkdownUpload: UploadProps['beforeUpload'] = (file) => {
    if (!file.name.toLowerCase().endsWith('.md')) {
      message.error('仅支持 .md 格式的 Markdown 文件')
      return Upload.LIST_IGNORE
    }
    if (file.size === 0) {
      message.error('不能上传空文件')
      return Upload.LIST_IGNORE
    }
    if (file.size > MAX_MARKDOWN_SIZE) {
      message.error('Markdown 文件不能超过 2 MB')
      return Upload.LIST_IGNORE
    }

    if (markdown.trim()) {
      Modal.confirm({
        title: '替换当前正文？',
        content: `读取“${file.name}”会替换编辑器中的现有内容。`,
        okText: '确认替换',
        cancelText: '取消',
        onOk: () => readMarkdownFile(file),
      })
    } else {
      void readMarkdownFile(file)
    }
    return Upload.LIST_IGNORE
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
      <DefaultCoverManager />
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
        width={960}
        okText="保存修改"
        cancelText="取消"
      >
        <Tabs
          className="admin-article-editor"
          items={[
            {
              key: 'meta',
              label: '基本信息',
              children: (
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
              onChange={(e) => {
                setCurrentArticle({
                  ...(currentArticle as Article),
                  article: e,
                })
                setSelectedMarkdownFile('')
                void loadArticleContent(e)
              }}
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
          <Form.Item label="文章封面">
            <div className="admin-article-cover-field">
              <Select
                value={useCustomCover ? 'custom' : 'default'}
                options={[
                  { label: '使用默认封面', value: 'default' },
                  { label: '使用单独封面', value: 'custom' },
                ]}
                onChange={(value) => {
                  if (value === 'default') {
                    setUseCustomCover(false)
                    setCurrentArticle({ ...(currentArticle as Article), banner: '' })
                  } else {
                    setUseCustomCover(true)
                    if (currentArticle?.banner === '404') {
                      setCurrentArticle({ ...(currentArticle as Article), banner: '' })
                    }
                  }
                }}
              />
              {useCustomCover && (
                <Input
                  value={currentArticle?.banner}
                  placeholder="输入七牛文件名、完整图片 URL 或站内路径"
                  onChange={(e) => setCurrentArticle({ ...(currentArticle as Article), banner: e.target.value })}
                />
              )}
              <img
                src={resolveArticleCover(currentArticle?.banner)}
                alt="文章封面预览"
                onError={(event) => {
                  event.currentTarget.onerror = null
                  event.currentTarget.src = bundledArticleCover
                }}
              />
              {useCustomCover && !currentArticle?.banner?.trim() && <span>请输入单独封面地址；留空保存时仍会回退默认封面。</span>}
            </div>
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
              ),
            },
            {
              key: 'content',
              label: '正文编辑',
              children: (
                <div className="admin-article-editor__content">
                  <Upload.Dragger
                    accept=".md,text/markdown"
                    beforeUpload={beforeMarkdownUpload}
                    disabled={contentLoading || saving}
                    maxCount={1}
                    showUploadList={false}
                  >
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="ant-upload-text">上传 Markdown 替换正文</p>
                    <p className="ant-upload-hint">文件会先读取到编辑器，点击“保存修改”后才会写入。</p>
                  </Upload.Dragger>
                  {selectedMarkdownFile && (
                    <Alert
                      type="success"
                      showIcon
                      icon={<FileMarkdownOutlined />}
                      message={`已读取：${selectedMarkdownFile}`}
                    />
                  )}
                  <MdEditor
                    placeholder={contentLoading ? '正在加载文章正文…' : '请输入 Markdown 正文'}
                    height="520px"
                    lineNum={1}
                    value={markdown}
                    subfield={true}
                    preview={true}
                    onChange={setMarkdown}
                  />
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  )
}
