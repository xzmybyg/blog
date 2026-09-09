import './index.scss'
import { ReloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { getCertificateStatus, triggerCertificateUpdate, type CertificateStatus } from '@/apis'

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
