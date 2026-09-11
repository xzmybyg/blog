import Style from './index.module.scss'
import { DEFAULT_SITE_NOTICE, getSiteNotice } from '@/apis'

function PublicNotice() {
  const { noticeCard, cardHeader, noticeIntro } = Style
  const [notice, setNotice] = useState(DEFAULT_SITE_NOTICE)

  useEffect(() => {
    getSiteNotice()
      .then((response) => setNotice(response.data))
      .catch(() => setNotice(DEFAULT_SITE_NOTICE))
  }, [])

  return (
    <Card className={noticeCard} style={{ width: 300 }}>
      <header className={cardHeader}>
        <span>SITE NOTE / 站点公告</span>
        <h2>公告</h2>
      </header>
      <p className={noticeIntro}>{notice.content}</p>
    </Card>
  )
}

export default PublicNotice
