import MdEditor from 'for-editor'
import { FileMarkdownOutlined, InboxOutlined } from '@ant-design/icons'
import { Alert, Modal, Select, Switch, Tabs, Upload } from 'antd'
import type { UploadProps } from 'antd'
import { createArticle, getLabelList } from '@/apis'
import './index.scss'

const MAX_MARKDOWN_SIZE = 2 * 1024 * 1024

export default function AddArticle() {
  const [fileName, setFileName] = useState('')
  const [markdown, setMarkdown] = useState('')
  const [importing, setImporting] = useState(false)
  const [importedFile, setImportedFile] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [labels, setLabels] = useState<Label[]>([])
  const [articleMeta, setArticleMeta] = useState({
    title: '',
    labelIds: [] as number[],
    banner: '',
    topping: false,
    hidden: false,
  })

  useEffect(() => {
    getLabelList().then((res) => setLabels(res.data)).catch(() => message.error('标签列表加载失败'))
  }, [])

  const handleChange = (value) => {
    setMarkdown(value)
  }

  const handlePublish = async () => {
    const normalizedFileName = fileName.trim().replace(/\.md$/i, '')
    if (!normalizedFileName) {
      message.error('请输入 Markdown 文件名')
      return
    }
    if (/[\\/:*?"<>|]/.test(normalizedFileName)) {
      message.error('文件名不能包含 \\ / : * ? " < > |')
      return
    }
    if (!articleMeta.title.trim()) {
      message.error('请输入文章标题')
      return
    }
    if (!markdown.trim()) {
      message.error('请输入正文或导入 Markdown 文件')
      return
    }
    setPublishing(true)
    try {
      await uploadArticleFile({ content: markdown, title: normalizedFileName })
      try {
        await createArticle({
          ...articleMeta,
          title: articleMeta.title.trim(),
          article: normalizedFileName,
        })
      } catch {
        message.error('Markdown 文件已保存，但文章信息创建失败，请检查后重试')
        return
      }
      message.success('发布成功')
    } catch {
      message.error('发布失败，请稍后重试')
    } finally {
      setPublishing(false)
    }
  }

  const handleAddImg = (file) => {
    console.log(file)
  }

  const importMarkdownFile = async (file: File) => {
    setImporting(true)
    try {
      const content = await file.text()
      const nextFileName = file.name.replace(/\.md$/i, '')
      setMarkdown(content)
      setImportedFile(file.name)
      setFileName(nextFileName)
      message.success(`已导入 ${file.name}`)
    } catch {
      message.error('文件读取失败，请确认文件编码为 UTF-8 后重试')
    } finally {
      setImporting(false)
    }
  }

  const handleMarkdownBeforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (!file.name.toLowerCase().endsWith('.md')) {
      message.error('仅支持 .md 格式的 Markdown 文件')
      return Upload.LIST_IGNORE
    }
    if (file.size === 0) {
      message.error('不能导入空文件')
      return Upload.LIST_IGNORE
    }
    if (file.size > MAX_MARKDOWN_SIZE) {
      message.error('Markdown 文件不能超过 2 MB')
      return Upload.LIST_IGNORE
    }

    if (markdown.trim()) {
      Modal.confirm({
        title: '替换当前正文？',
        content: `导入“${file.name}”会替换编辑器中的现有内容，文章标题不会被覆盖。`,
        okText: '确认替换',
        cancelText: '取消',
        onOk: () => importMarkdownFile(file),
      })
    } else {
      void importMarkdownFile(file)
    }

    return Upload.LIST_IGNORE
  }

  const toolbar = {
    h1: true, // h1
    h2: true, // h2
    h3: true, // h3
    h4: true, // h4
    img: true, // 图片
    link: true, // 链接
    code: true, // 代码块
    preview: true, // 预览
    expand: true, // 全屏
    /* v0.0.9 */
    undo: true, // 撤销
    redo: true, // 重做
    save: false, // 使用页面底部的发布按钮
    /* v0.2.3 */
    subfield: true, // 单双栏模式
  }

  // const handleTestUploadQiniu = ()=>{
  //   UploadArticleQiniu({fileName:article})
  // }

  return (
    <div id="addArticle" className="add-article">
      <Form>
        <section className="add-article__heading">
          <span>ARTICLE / 新建内容</span>
          <h1>添加文章</h1>
          <p>手动编写正文，或从本地 Markdown 文件开始。</p>
        </section>
        <div className="add-article__title-row">
          <Form.Item label="文章标题" required>
            <Input
              placeholder="请输入文章展示标题"
              value={articleMeta.title}
              onChange={(e) => setArticleMeta((current) => ({ ...current, title: e.target.value }))}
            />
          </Form.Item>
          <Button
            type="primary"
            loading={publishing}
            disabled={importing}
            onClick={handlePublish}
          >
            发布文章
          </Button>
        </div>
        <Form.Item label="文件名">
          <Input
            type="text"
            placeholder="例如 react-hooks-guide"
            addonAfter=".md"
            value={fileName}
            onChange={(e) => setFileName(e.target.value.replace(/\.md$/i, ''))}
          />
        </Form.Item>
        <div className="add-article__meta-grid">
          <Form.Item label="标签">
            <Select
              mode="multiple"
              placeholder="请选择标签"
              value={articleMeta.labelIds}
              options={labels.map((item) => ({ label: item.label, value: item.id }))}
              onChange={(value) => setArticleMeta((current) => ({ ...current, labelIds: value }))}
            />
          </Form.Item>
          <Form.Item label="封面">
            <Input
              placeholder="请输入封面图片地址"
              value={articleMeta.banner}
              onChange={(e) => setArticleMeta((current) => ({ ...current, banner: e.target.value }))}
            />
          </Form.Item>
          <div className="add-article__switches">
            <Form.Item label="置顶">
              <Switch
                checkedChildren="是"
                unCheckedChildren="否"
                checked={articleMeta.topping}
                onChange={(checked) => setArticleMeta((current) => ({ ...current, topping: checked }))}
              />
            </Form.Item>
            <Form.Item label="隐藏">
              <Switch
                checkedChildren="是"
                unCheckedChildren="否"
                checked={articleMeta.hidden}
                onChange={(checked) => setArticleMeta((current) => ({ ...current, hidden: checked }))}
              />
            </Form.Item>
          </div>
        </div>
        <Tabs
          className="add-article__tabs"
          defaultActiveKey="upload"
          items={[
            {
              key: 'upload',
              label: '上传 Markdown',
              children: (
                <Form.Item extra="支持单个 .md 文件，最大 2 MB；新文件会替换当前正文。">
                  <Upload.Dragger
                    accept=".md,text/markdown"
                    beforeUpload={handleMarkdownBeforeUpload}
                    disabled={importing}
                    maxCount={1}
                    showUploadList={false}
                  >
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="ant-upload-text">拖放 Markdown 文件到这里，或点击选择文件</p>
                    <p className="ant-upload-hint">文件只在浏览器本地读取，发布时提交文章内容。</p>
                  </Upload.Dragger>
                  {importedFile && (
                    <Alert
                      className="add-article__file-status"
                      type="success"
                      showIcon
                      icon={<FileMarkdownOutlined />}
                      message={`已选择：${importedFile}`}
                      description={`已读取 ${markdown.length} 个字符，可以直接发布。`}
                      aria-live="polite"
                    />
                  )}
                </Form.Item>
              ),
            },
            {
              key: 'editor',
              label: '在线编辑',
              children: (
                <Form.Item>
                  <MdEditor
                    placeholder="请输入Markdown文本"
                    height={'600px'}
                    lineNum={1}
                    toolbar={toolbar}
                    value={markdown}
                    subfield={true}
                    preview={true}
                    onChange={handleChange}
                    addImg={handleAddImg}
                  />
                </Form.Item>
              ),
            },
          ]}
        />
      </Form>
    </div>
  )
}
