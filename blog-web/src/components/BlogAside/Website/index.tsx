import Style from './index.module.scss'
import { getSiteStatistics } from '@/apis'

function Website() {
  const { websiteCard, cardHeader, onlineDot, runtime, metrics } = Style
  const [time, setTime] = useState(0)
  const [pageViews, setPageViews] = useState<number | null>(null)
  const [uniqueVisitors, setUniqueVisitors] = useState<number | null>(null)

  useEffect(() => {
    const startTime = new Date('2024-01-19T14:42:15').getTime() // 网站开始运行的时间

    const intervalId = setInterval(() => {
      setTime(Date.now() - startTime)
    }, 1000) // 每秒更新一次

    return () => {
      clearInterval(intervalId) // 清除定时器
    }
  }, [])

  useEffect(() => {
    const loadStatistics = () => {
      getSiteStatistics()
        .then((res) => {
          setPageViews(Number(res.data?.pageViews) || 0)
          setUniqueVisitors(Number(res.data?.uniqueVisitors) || 0)
        })
        .catch(() => {
          setPageViews(null)
          setUniqueVisitors(null)
        })
    }

    loadStatistics()
    window.addEventListener('site-statistics-updated', loadStatistics)
    return () => window.removeEventListener('site-statistics-updated', loadStatistics)
  }, [])

  const seconds = Math.floor(time / 1000) % 60
  const minutes = Math.floor(time / 60000) % 60
  const hours = Math.floor(time / 3600000) % 24
  const days = Math.floor(time / 86400000)
  const clock = [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')

  return (
    <Card className={websiteCard} style={{ width: 300 }}>
      <header className={cardHeader}>
        <div><i className={onlineDot} aria-hidden="true" /><span>LIVE METRICS</span></div>
        <h2>网站资讯</h2>
      </header>
      <div className={runtime}>
        <span>持续运行</span>
        <strong>{days}<small>天</small></strong>
        <time>{clock}</time>
      </div>
      <dl className={metrics}>
        <div><dt>PV</dt><dd>{pageViews === null ? '---' : pageViews.toLocaleString('zh-CN')}</dd><span>浏览量</span></div>
        <div><dt>UV</dt><dd>{uniqueVisitors === null ? '---' : uniqueVisitors.toLocaleString('zh-CN')}</dd><span>访客数</span></div>
      </dl>
    </Card>
  )
}

export default Website
