import dayjs from 'dayjs'
import {
  CheckCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  RollbackOutlined,
} from '@ant-design/icons'
import { Button, Empty, Modal, Select, Skeleton, Tag, Typography } from 'antd'
import {
  deleteErrorEvent,
  getErrorEvents,
  resolveErrorEvent,
  type ErrorEvent,
  type ErrorMonitorResponse,
} from '@/apis'
import useUserStore from '@/store/user'
import './index.scss'

type ErrorStatus = 'open' | 'resolved' | 'all'

const SOURCE_LABELS = { client: '前端', server: '服务端', process: '进程' }

export default function ErrorMonitorAdmin() {
  const readOnly = useUserStore((state) => state.role === 'viewer')
  const [status, setStatus] = useState<ErrorStatus>('open')
  const [data, setData] = useState<ErrorMonitorResponse>({
    items: [],
    summary: { total: 0, openCount: 0, occurrences: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const loadErrors = useCallback(() => {
    setLoading(true)
    return getErrorEvents(status)
      .then((response) => setData(response.data))
      .catch(() => message.error('错误记录加载失败，请检查后端服务和数据库迁移'))
      .finally(() => setLoading(false))
  }, [status])

  useEffect(() => {
    void loadErrors()
  }, [loadErrors])

  const changeResolved = async (event: ErrorEvent, resolved: boolean) => {
    setUpdatingId(event.id)
    try {
      await resolveErrorEvent(event.id, resolved)
      message.success(resolved ? '错误已标记为已处理' : '错误已重新打开')
      await loadErrors()
    } catch (error: any) {
      message.error(error.response?.data?.message || '错误状态更新失败')
    } finally {
      setUpdatingId(null)
    }
  }

  const removeError = (event: ErrorEvent) => {
    Modal.confirm({
      title: '删除这条错误记录？',
      content: '删除后无法恢复；相同错误再次发生时会重新创建记录。',
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        setUpdatingId(event.id)
        try {
          await deleteErrorEvent(event.id)
          message.success('错误记录已删除')
          await loadErrors()
        } catch (error: any) {
          message.error(error.response?.data?.message || '错误记录删除失败')
          throw error
        } finally {
          setUpdatingId(null)
        }
      },
    })
  }

  return (
    <section className="error-monitor-admin">
      <header className="error-monitor-admin__header">
        <div>
          <span>INCIDENT LEDGER / 运行记录</span>
          <h1>错误监控</h1>
          <p>相同错误会自动合并，优先处理最近重复出现的问题。</p>
        </div>
        <div>
          <Select<ErrorStatus>
            aria-label="错误状态筛选"
            value={status}
            options={[
              { value: 'open', label: '未处理' },
              { value: 'resolved', label: '已处理' },
              { value: 'all', label: '全部记录' },
            ]}
            onChange={setStatus}
          />
          <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void loadErrors()}>刷新</Button>
        </div>
      </header>

      <dl className="error-monitor-summary">
        <div><dt>未处理</dt><dd>{data.summary.openCount}</dd></div>
        <div><dt>错误类型</dt><dd>{data.summary.total}</dd></div>
        <div><dt>累计发生</dt><dd>{data.summary.occurrences}</dd></div>
      </dl>

      {loading ? (
        <div className="error-monitor-loading"><Skeleton active paragraph={{ rows: 9 }} /></div>
      ) : data.items.length === 0 ? (
        <Empty description={status === 'open' ? '当前没有未处理错误' : '没有符合条件的错误记录'} />
      ) : (
        <div className="error-ledger">
          {data.items.map((event) => {
            const resolved = Boolean(event.resolved)
            return (
              <article className={`error-event ${resolved ? 'error-event--resolved' : ''}`} key={event.id}>
                <div className="error-event__rail" aria-hidden="true" />
                <header>
                  <div className="error-event__identity">
                    {resolved ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                    <div>
                      <span>{SOURCE_LABELS[event.source]} · {event.level === 'fatal' ? '致命错误' : '运行错误'}</span>
                      <h2>{event.message}</h2>
                    </div>
                  </div>
                  <Tag color={resolved ? 'success' : event.level === 'fatal' ? 'error' : 'warning'}>
                    {resolved ? '已处理' : '待处理'}
                  </Tag>
                </header>

                <dl className="error-event__facts">
                  <div><dt>出现次数</dt><dd>{event.occurrences}</dd></div>
                  <div><dt>最近发生</dt><dd>{dayjs(event.last_seen_at).format('YYYY-MM-DD HH:mm:ss')}</dd></div>
                  <div><dt>接口</dt><dd>{[event.method, event.route].filter(Boolean).join(' ') || '页面运行时'}</dd></div>
                  <div><dt>状态码</dt><dd>{event.status_code || '—'}</dd></div>
                </dl>

                <details className="error-event__details">
                  <summary>查看排查信息</summary>
                  <div>
                    <span>错误编号</span>
                    <Typography.Text copyable={Boolean(event.request_id)}>{event.request_id || '—'}</Typography.Text>
                  </div>
                  <div><span>首次发生</span><p>{dayjs(event.first_seen_at).format('YYYY-MM-DD HH:mm:ss')}</p></div>
                  <div><span>错误指纹</span><Typography.Text copyable>{event.fingerprint}</Typography.Text></div>
                  {event.stack && <pre>{event.stack}</pre>}
                </details>

                {!readOnly && (
                  <footer>
                    <Button
                      icon={resolved ? <RollbackOutlined /> : <CheckCircleOutlined />}
                      loading={updatingId === event.id}
                      disabled={updatingId !== null && updatingId !== event.id}
                      onClick={() => void changeResolved(event, !resolved)}
                    >{resolved ? '重新打开' : '标记已处理'}</Button>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      disabled={updatingId !== null}
                      onClick={() => removeError(event)}
                    >删除</Button>
                  </footer>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
