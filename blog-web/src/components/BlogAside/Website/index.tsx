import './index.scss'

function Website() {
  const [time, setTime] = useState(0)
  useEffect(() => {
    const startTime = new Date('2024-01-19T14:42:15').getTime() // 网站开始运行的时间

    const intervalId = setInterval(() => {
      setTime(Date.now() - startTime)
    }, 1000) // 每秒更新一次

    return () => {
      clearInterval(intervalId) // 清除定时器
    }
  }, [])

  const seconds = Math.floor(time / 1000) % 60
  const minutes = Math.floor(time / 60000) % 60
  const hours = Math.floor(time / 3600000) % 24
  const days = Math.floor(time / 86400000)

  return (
    <Card className="side" title="网站资讯" style={{ width: 300 }}>
      <Flex justify="space-between">
        <span>本站已运行：</span>
        <span>
          {days}天{hours}小时{minutes}分钟{seconds}秒
        </span>
      </Flex>
      <Flex justify="space-between">
        <span>访问量：</span>
        <span>---</span>
      </Flex>
    </Card>
  )
}

export default Website
