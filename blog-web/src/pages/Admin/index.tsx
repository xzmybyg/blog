import './index.scss'
import { FileTextOutlined, InboxOutlined, NotificationOutlined, PictureOutlined, ReloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Modal, Upload } from 'antd'
import type { UploadProps } from 'antd'
import {
  getCertificateStatus,
  getHomeContent,
  getSiteStatistics,
  getSiteNotice,
  getSiteBackgroundInfo,
  getSiteBackgroundUrl,
  triggerCertificateUpdate,
  updateHomeContent,
  updateSiteNotice,
  uploadSiteBackground,
  type CertificateStatus,
  type HomeContent,
  type SiteNotice,
  type SiteBackgroundInfo,
  type SiteBackgroundType,
} from '@/apis'
import useUserStore from '@/store/user'

const MAX_BACKGROUND_SIZE = 8 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

type HomeContentFormValues = Omit<HomeContent, 'typedTexts'> & {
  typedTexts: string
}

function HomeContentManager() {
  const readOnly = useUserStore((state) => state.role === 'viewer')
  const [form] = Form.useForm<HomeContentFormValues>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getHomeContent()
      .then((response) => {
        form.setFieldsValue({ ...response.data, typedTexts: response.data.typedTexts.join('\n') })
      })
      .catch(() => message.error('首页文案加载失败，请检查后端服务'))
      .finally(() => setLoading(false))
  }, [form])

  const saveContent = async (values: HomeContentFormValues) => {
    const content = {
      ...values,
      typedTexts: values.typedTexts.split('\n').map((text) => text.trim()).filter(Boolean),
    }
    setSaving(true)
    try {
      const response = await updateHomeContent(content)
      form.setFieldsValue({ ...response.data, typedTexts: response.data.typedTexts.join('\n') })
      message.success('首页文案已保存')
    } catch (error: any) {
      message.error(error.response?.data?.message || '首页文案保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section id="home-content" className="home-content-management" aria-labelledby="home-content-title" aria-busy={loading || saving}>
      <header>
        <FileTextOutlined aria-hidden="true" />
        <div>
          <span>HOME COPY / 首页文案</span>
          <h2 id="home-content-title">首屏内容</h2>
          <p>编辑首页主视觉中的标题、简介与轮播身份。</p>
        </div>
      </header>
      <Form form={form} layout="vertical" disabled={loading || readOnly} onFinish={saveContent}>
        <div className="home-content-management__grid">
          <Form.Item label="眉题" name="eyebrow" rules={[{ required: true, message: '请输入眉题' }, { max: 80 }]}>
            <Input maxLength={80} showCount placeholder="例如：FRONTEND FIELD NOTES · BEIJING" />
          </Form.Item>
          <Form.Item label="作者名" name="authorName" rules={[{ required: true, message: '请输入作者名' }, { max: 40 }]}>
            <Input maxLength={40} showCount />
          </Form.Item>
        </div>
        <Form.Item label="主标题" name="title" rules={[{ required: true, message: '请输入主标题' }, { max: 120 }]}>
          <Input.TextArea rows={2} maxLength={120} showCount placeholder="换行会保留在首页标题中" />
        </Form.Item>
        <Form.Item label="简介" name="description" rules={[{ required: true, message: '请输入简介' }, { max: 300 }]}>
          <Input.TextArea rows={3} maxLength={300} showCount />
        </Form.Item>
        <Form.Item
          label="轮播身份"
          name="typedTexts"
          extra="每行一条，最多 8 条。"
          rules={[{ required: true, message: '请至少填写一条轮播身份' }]}
        >
          <Input.TextArea rows={4} placeholder={'一名前端开发工程师\nA Web <Developer />'} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>保存首页文案</Button>
      </Form>
    </section>
  )
}

function SiteNoticeManager() {
  const readOnly = useUserStore((state) => state.role === 'viewer')
  const [form] = Form.useForm<SiteNotice>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSiteNotice()
      .then((response) => form.setFieldsValue(response.data))
      .catch(() => message.error('站点公告加载失败，请检查后端服务'))
      .finally(() => setLoading(false))
  }, [form])

  const saveNotice = async (values: SiteNotice) => {
    setSaving(true)
    try {
      const response = await updateSiteNotice(values)
      form.setFieldsValue(response.data)
      message.success('站点公告已保存')
    } catch (error: any) {
      message.error(error.response?.data?.message || '站点公告保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section id="site-notice" className="site-notice-management" aria-labelledby="site-notice-title" aria-busy={loading || saving}>
      <header>
        <NotificationOutlined aria-hidden="true" />
        <div>
          <span>SITE NOTE / 站点公告</span>
          <h2 id="site-notice-title">侧栏公告</h2>
          <p>编辑公开页面侧栏中展示的纯文本公告。</p>
        </div>
      </header>
      <Form form={form} layout="vertical" disabled={loading || readOnly} onFinish={saveNotice}>
        <Form.Item label="公告内容" name="content" rules={[{ required: true, message: '请输入公告内容' }, { max: 500 }]}>
          <Input.TextArea rows={5} maxLength={500} showCount placeholder="输入要在侧栏展示的公告文字" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>保存站点公告</Button>
      </Form>
    </section>
  )
}

type BackgroundManagerProps = {
  type: SiteBackgroundType
  title: string
  description: string
}

function BackgroundManager({ type, title, description }: BackgroundManagerProps) {
  const readOnly = useUserStore((state) => state.role === 'viewer')
  const [info, setInfo] = useState<SiteBackgroundInfo>({ exists: false })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    getSiteBackgroundInfo(type)
      .then((response) => setInfo(response.data))
      .catch(() => message.error(`${title}状态加载失败`))
      .finally(() => setLoading(false))
  }, [title, type])

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('')
      return
    }
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      message.error('仅支持 JPG、PNG 或 WebP 图片')
      return Upload.LIST_IGNORE
    }
    if (file.size === 0) {
      message.error('不能上传空文件')
      return Upload.LIST_IGNORE
    }
    if (file.size > MAX_BACKGROUND_SIZE) {
      message.error('背景图不能超过 8 MB')
      return Upload.LIST_IGNORE
    }
    setSelectedFile(file)
    return Upload.LIST_IGNORE
  }

  const replaceBackground = () => {
    if (!selectedFile) return
    Modal.confirm({
      title: `替换${title}？`,
      content: '保存后将立即用于公开页面，原背景图会被覆盖。',
      okText: '确认替换',
      cancelText: '取消',
      onOk: async () => {
        setUploading(true)
        try {
          const response = await uploadSiteBackground(type, selectedFile)
          setInfo(response.data)
          setSelectedFile(null)
          message.success(`${title}已替换`)
        } catch {
          message.error('上传失败，原背景图未变更，请稍后重试')
          throw new Error('Upload failed')
        } finally {
          setUploading(false)
        }
      },
    })
  }

  const currentUrl = info.exists
    ? getSiteBackgroundUrl(type, info.updatedAt)
    : `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}banner.jpg`

  return (
    <section className="background-manager" aria-busy={loading || uploading}>
      <div className="background-manager__heading">
        <PictureOutlined aria-hidden="true" />
        <div>
          <span>SITE BACKGROUND</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="background-manager__preview">
        {!loading && <img src={previewUrl || currentUrl} alt={`${title}${previewUrl ? '待上传预览' : '当前预览'}`} />}
        {loading && <span>正在加载预览…</span>}
        {previewUrl && <strong>待替换</strong>}
      </div>
      <Upload.Dragger
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        beforeUpload={beforeUpload}
        maxCount={1}
        showUploadList={false}
        disabled={uploading || readOnly}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">拖放图片到这里，或点击选择</p>
        <p className="ant-upload-hint">JPG、PNG、WebP，最大 8 MB</p>
      </Upload.Dragger>
      <div className="background-manager__actions">
        <span>{selectedFile ? `${selectedFile.name} · ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : info.exists ? '当前使用已上传图片' : '当前使用项目默认图片'}</span>
        <div>
          {selectedFile && <Button disabled={uploading} onClick={() => setSelectedFile(null)}>取消选择</Button>}
          <Button type="primary" disabled={readOnly || !selectedFile} loading={uploading} onClick={replaceBackground}>
            上传并替换
          </Button>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const readOnly = useUserStore((state) => state.role === 'viewer')
  const [certificate, setCertificate] = useState<CertificateStatus | null>(null)
  const [certificateError, setCertificateError] = useState(false)
  const [statistics, setStatistics] = useState<{ pageViews: number; uniqueVisitors: number } | null>(null)
  const [statisticsError, setStatisticsError] = useState(false)
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false)
  const [updatingCertificate, setUpdatingCertificate] = useState(false)

  useEffect(() => {
    getCertificateStatus()
      .then((response) => setCertificate(response.data))
      .catch(() => setCertificateError(true))

    getSiteStatistics()
      .then((response) => setStatistics(response.data))
      .catch(() => setStatisticsError(true))
  }, [])

  const expiryDate = certificate
    ? new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(certificate.validTo))
    : '--'

  const certificateTone = certificate
    ? certificate.remainingDays <= 7
      ? 'danger'
      : certificate.remainingDays <= 30
        ? 'warning'
        : 'healthy'
    : 'loading'

  const handleCertificateUpdate = async () => {
    setUpdatingCertificate(true)
    try {
      const response = await triggerCertificateUpdate()
      setConfirmUpdateOpen(false)
      message.success(response.data.message)
    } catch (error: any) {
      message.error(error.response?.data?.message || '证书更新任务提交失败')
    } finally {
      setUpdatingCertificate(false)
    }
  }

  return (
    <section className="admin-dashboard">
      <span className="admin-dashboard__eyebrow">OVERVIEW / 工作台</span>
      <h1>欢迎回来</h1>
      <p>从左侧导航进入内容模块，开始管理博客。</p>
      <div className="admin-dashboard__guide">
        <strong>快速开始</strong>
        <span>文章管理 · 用户管理 · 互动管理</span>
      </div>
      <nav className="admin-dashboard__anchors" aria-label="首页区块导航">
        <a href="#traffic-overview">访问统计</a>
        <a href="#certificate-status">证书状态</a>
        <a href="#home-content">首页文案</a>
        <a href="#site-notice">站点公告</a>
        <a href="#background-management">背景图</a>
      </nav>
      <section id="traffic-overview" className="traffic-overview" aria-labelledby="traffic-overview-title" aria-live="polite">
        <header>
          <span>TRAFFIC / 访问概览</span>
          <h2 id="traffic-overview-title">累计流量</h2>
          <p>{statisticsError ? '统计接口不可用，请检查后端服务和数据库迁移。' : '公开页面的累计浏览与独立访客。'}</p>
        </header>
        <dl>
          <div>
            <dt>PV</dt>
            <dd>{statistics ? statistics.pageViews.toLocaleString('zh-CN') : '--'}</dd>
            <span>页面浏览量</span>
          </div>
          <div>
            <dt>UV</dt>
            <dd>{statistics ? statistics.uniqueVisitors.toLocaleString('zh-CN') : '--'}</dd>
            <span>独立访客数</span>
          </div>
        </dl>
      </section>
      <section id="certificate-status" className={`certificate-status certificate-status--${certificateTone}`} aria-live="polite">
        <div className="certificate-status__summary">
          <div className="certificate-status__heading">
            <SafetyCertificateOutlined aria-hidden="true" />
            <div>
              <span>HTTPS CERTIFICATE</span>
              <h2>线上证书</h2>
            </div>
          </div>
          <Button
            icon={<ReloadOutlined />}
            disabled={readOnly || certificateError}
            onClick={() => setConfirmUpdateOpen(true)}
          >
            立即更新
          </Button>
        </div>
        {certificateError ? (
          <p className="certificate-status__error">暂时无法获取证书状态，请稍后刷新。</p>
        ) : (
          <div className="certificate-status__details">
            <div className="certificate-status__days">
              <strong>{certificate?.remainingDays ?? '--'}</strong>
              <span>天后到期</span>
            </div>
            <dl>
              <div><dt>域名</dt><dd>{certificate?.domain ?? '正在获取…'}</dd></div>
              <div><dt>到期时间</dt><dd>{expiryDate}</dd></div>
            </dl>
          </div>
        )}
      </section>
      <HomeContentManager />
      <SiteNoticeManager />
      <section id="background-management" className="background-management" aria-labelledby="background-management-title">
        <header>
          <span>VISUAL ASSETS / 页面背景</span>
          <h2 id="background-management-title">背景图管理</h2>
          <p>分别维护首页和留言页背景，选择文件后确认替换。</p>
        </header>
        <div className="background-management__grid">
          <BackgroundManager type="home" title="首页背景图" description="用于首页首屏主视觉。" />
          <BackgroundManager type="message" title="留言页背景图" description="用于留言板全页背景。" />
        </div>
      </section>
      <Modal
        title="立即强制更新线上证书？"
        open={confirmUpdateOpen}
        okText="确认更新"
        cancelText="取消"
        okButtonProps={{ danger: true, loading: updatingCertificate }}
        cancelButtonProps={{ disabled: updatingCertificate }}
        closable={!updatingCertificate}
        maskClosable={!updatingCertificate}
        keyboard={!updatingCertificate}
        onOk={handleCertificateUpdate}
        onCancel={() => setConfirmUpdateOpen(false)}
      >
        <p className="certificate-update-confirm">
          将忽略当前剩余天数，调用 OHTTPS 更新并部署 <strong>{certificate?.domain}</strong> 的证书，
          过程中会产生余额消耗并重载 nginx。任务提交后不能撤销。
        </p>
      </Modal>
    </section>
  )
}
