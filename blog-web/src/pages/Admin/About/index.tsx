import MdEditor from 'for-editor'
import { FileMarkdownOutlined, InboxOutlined } from '@ant-design/icons'
import { Alert, Modal, Skeleton, Tabs, Upload } from 'antd'
import type { UploadProps } from 'antd'
import './index.scss'

const MAX_MARKDOWN_SIZE = 2 * 1024 * 1024

export default function AboutAdmin() {
  const [content, setContent] = useState('')
  const [savedContent, setSavedContent] = useState('')
  const [selectedFile, setSelectedFile] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const hasChanges = content !== savedContent

  const loadContent = useCallback(() => {
    setLoading(true)
    getAboutContent()
      .then((response) => {
        setContent(response.data)
        setSavedContent(response.data)
        setSelectedFile('')
      })
      .catch(() => message.error('关于页内容加载失败'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  useEffect(() => {
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (!hasChanges) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeave)
    return () => window.removeEventListener('beforeunload', warnBeforeLeave)
  }, [hasChanges])

  const saveContent = async () => {
    if (!content.trim()) {
      message.error('关于页内容不能为空')
      return
    }
    setSaving(true)
    try {
      await updateAboutContent(content)
      setSavedContent(content)
      setSelectedFile('')
      message.success('关于页已保存')
    } catch {
      message.error('保存失败，当前内容已保留，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const readMarkdownFile = async (file: File) => {
    try {
      const nextContent = await file.text()
      setContent(nextContent)
      setSelectedFile(file.name)
      message.success(`已读取 ${file.name}，保存后将替换线上内容`)
    } catch {
      message.error('文件读取失败，请确认文件编码为 UTF-8')
    }
  }

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
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

    if (hasChanges) {
      Modal.confirm({
        title: '替换当前未保存内容？',
        content: `读取“${file.name}”会替换编辑器中尚未保存的内容。`,
        okText: '确认替换',
        cancelText: '取消',
        onOk: () => readMarkdownFile(file),
      })
    } else {
      void readMarkdownFile(file)
    }
    return Upload.LIST_IGNORE
  }

  return (
    <div className="about-admin">
      <header className="about-admin__heading">
        <div>
          <span>ABOUT / 内容管理</span>
          <h1>关于页管理</h1>
          <p>编辑 Markdown，或上传文件替换关于页内容。</p>
        </div>
        <Button
          className="about-admin__save-button"
          type="primary"
          loading={saving}
          disabled={loading || !hasChanges}
          onClick={saveContent}
        >
          保存关于页
        </Button>
      </header>

      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <Tabs
          defaultActiveKey="editor"
          items={[
            {
              key: 'editor',
              label: '在线编辑',
              children: (
                <MdEditor
                  placeholder="请输入关于页 Markdown 内容"
                  height="620px"
                  lineNum={1}
                  value={content}
                  subfield={true}
                  preview={true}
                  onChange={setContent}
                />
              ),
            },
            {
              key: 'upload',
              label: '上传 Markdown',
              children: (
                <div className="about-admin__upload-panel">
                  <Upload.Dragger
                    accept=".md,text/markdown"
                    beforeUpload={beforeUpload}
                    maxCount={1}
                    showUploadList={false}
                  >
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="ant-upload-text">拖放 Markdown 文件到这里，或点击选择文件</p>
                    <p className="ant-upload-hint">支持单个 UTF-8 编码的 .md 文件，最大 2 MB。</p>
                  </Upload.Dragger>
                  {selectedFile && (
                    <Alert
                      type="success"
                      showIcon
                      icon={<FileMarkdownOutlined />}
                      message={`已读取：${selectedFile}`}
                      description="点击右上角“保存关于页”后，文件内容将替换线上关于页。"
                      aria-live="polite"
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  )
}
