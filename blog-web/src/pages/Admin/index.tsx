import './index.scss'
import { InboxOutlined, PictureOutlined, ReloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Modal, Upload } from 'antd'
import type { UploadProps } from 'antd'
import {
  getCertificateStatus,
  getSiteBackgroundInfo,
  getSiteBackgroundUrl,
  triggerCertificateUpdate,
  uploadSiteBackground,
  type CertificateStatus,
  type SiteBackgroundInfo,
  type SiteBackgroundType,
} from '@/apis'

const MAX_BACKGROUND_SIZE = 8 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

type BackgroundManagerProps = {
  type: SiteBackgroundType
  title: string
  description: string
}

function BackgroundManager({ type, title, description }: BackgroundManagerProps) {
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
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">拖放图片到这里，或点击选择</p>
        <p className="ant-upload-hint">JPG、PNG、WebP，最大 8 MB</p>
      </Upload.Dragger>
      <div className="background-manager__actions">
        <span>{selectedFile ? `${selectedFile.name} · ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : info.exists ? '当前使用已上传图片' : '当前使用项目默认图片'}</span>
        <div>
          {selectedFile && <Button disabled={uploading} onClick={() => setSelectedFile(null)}>取消选择</Button>}
          <Button type="primary" disabled={!selectedFile} loading={uploading} onClick={replaceBackground}>
            上传并替换
          </Button>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [certificate, setCertificate] = useState<CertificateStatus | null>(null)
  const [certificateError, setCertificateError] = useState(false)
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false)
  const [updatingCertificate, setUpdatingCertificate] = useState(false)

  useEffect(() => {
    getCertificateStatus()
      .then((response) => setCertificate(response.data))
      .catch(() => setCertificateError(true))
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
      <section className={`certificate-status certificate-status--${certificateTone}`} aria-live="polite">
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
            disabled={certificateError}
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
      <section className="background-management" aria-labelledby="background-management-title">
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
