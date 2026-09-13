import { ReloadOutlined, SafetyOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons'
import { Button, Empty, InputNumber, Modal, Select, Skeleton, Tag } from 'antd'
import {
  getRateLimitConfig,
  resetRateLimitConfig,
  updateRateLimitConfig,
  type RateLimitRule,
  type RateLimitSource,
} from '@/apis'
import useUserStore from '@/store/user'
import './index.scss'

type TimeUnit = 'ms' | 's' | 'm' | 'h' | 'd'
type RuleDraft = { max: number; duration: number; unit: TimeUnit }

const UNIT_OPTIONS: Array<{ value: TimeUnit; label: string; milliseconds: number }> = [
  { value: 'ms', label: '毫秒', milliseconds: 1 },
  { value: 's', label: '秒', milliseconds: 1000 },
  { value: 'm', label: '分钟', milliseconds: 60 * 1000 },
  { value: 'h', label: '小时', milliseconds: 60 * 60 * 1000 },
  { value: 'd', label: '天', milliseconds: 24 * 60 * 60 * 1000 },
]

const SOURCE_LABELS: Record<RateLimitSource, string> = {
  default: '系统默认',
  environment: '环境变量',
  database: '后台配置',
}

function splitDuration(windowMs: number): Pick<RuleDraft, 'duration' | 'unit'> {
  for (const option of [...UNIT_OPTIONS].reverse()) {
    if (windowMs >= option.milliseconds && windowMs % option.milliseconds === 0) {
      return { duration: windowMs / option.milliseconds, unit: option.value }
    }
  }
  return { duration: windowMs, unit: 'ms' }
}

function createDraft(rule: RateLimitRule): RuleDraft {
  return { max: rule.max, ...splitDuration(rule.windowMs) }
}

function getWindowMs(draft: RuleDraft) {
  return draft.duration * (UNIT_OPTIONS.find((option) => option.value === draft.unit)?.milliseconds || 1)
}

export default function RateLimitAdmin() {
  const readOnly = useUserStore((state) => state.role === 'viewer')
  const [rules, setRules] = useState<RateLimitRule[]>([])
  const [drafts, setDrafts] = useState<Record<string, RuleDraft>>({})
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const loadRules = useCallback(() => {
    setLoading(true)
    return getRateLimitConfig()
      .then((response) => {
        const nextRules = Array.isArray(response.data) ? response.data : []
        setRules(nextRules)
        setDrafts(Object.fromEntries(nextRules.map((rule) => [rule.key, createDraft(rule)])))
      })
      .catch(() => message.error('限流配置加载失败，请检查后端服务和数据库迁移'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void loadRules()
  }, [loadRules])

  const replaceRule = (nextRule: RateLimitRule) => {
    setRules((current) => current.map((rule) => rule.key === nextRule.key ? nextRule : rule))
    setDrafts((current) => ({ ...current, [nextRule.key]: createDraft(nextRule) }))
  }

  const updateDraft = (key: string, changes: Partial<RuleDraft>) => {
    setDrafts((current) => ({ ...current, [key]: { ...current[key], ...changes } }))
  }

  const saveRule = async (rule: RateLimitRule) => {
    const draft = drafts[rule.key]
    if (!draft || draft.max < 1 || draft.duration < 1) {
      message.error('请求次数和统计时间必须大于 0')
      return
    }

    const windowMs = getWindowMs(draft)
    if (windowMs < 100 || windowMs > 30 * 24 * 60 * 60 * 1000) {
      message.error('统计窗口必须在 100 毫秒到 30 天之间')
      return
    }

    setSavingKey(rule.key)
    try {
      const response = await updateRateLimitConfig(rule.key, { max: draft.max, windowMs })
      replaceRule(response.data)
      message.success(`${rule.label}限流已立即生效`)
    } catch (error: any) {
      message.error(error.response?.data?.message || '限流配置保存失败')
    } finally {
      setSavingKey(null)
    }
  }

  const resetRule = (rule: RateLimitRule) => {
    Modal.confirm({
      title: `重置“${rule.label}”限流？`,
      content: '将移除后台配置，恢复为环境变量或系统默认值，并立即生效。',
      okText: '确认重置',
      cancelText: '取消',
      onOk: async () => {
        setSavingKey(rule.key)
        try {
          const response = await resetRateLimitConfig(rule.key)
          replaceRule(response.data)
          message.success(`${rule.label}限流已重置`)
        } catch (error: any) {
          message.error(error.response?.data?.message || '限流配置重置失败')
          throw error
        } finally {
          setSavingKey(null)
        }
      },
    })
  }

  return (
    <section className="rate-limit-admin">
      <header className="rate-limit-admin__header">
        <div>
          <span>REQUEST GUARD / 接口保护</span>
          <h1>限流配置</h1>
          <p>控制各类接口在指定时间内允许的最大请求数，保存后立即生效。</p>
        </div>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void loadRules()}>刷新配置</Button>
      </header>

      <div className="rate-limit-admin__notice">
        <SafetyOutlined aria-hidden="true" />
        <p><strong>配置保护已开启</strong><span>本页面使用独立安全限制，不会因全局规则调整而失去管理入口。</span></p>
      </div>

      {loading ? (
        <div className="rate-limit-admin__loading"><Skeleton active paragraph={{ rows: 8 }} /></div>
      ) : rules.length === 0 ? (
        <Empty description="暂无限流配置" />
      ) : (
        <div className="rate-limit-grid">
          {rules.map((rule) => {
            const draft = drafts[rule.key] || createDraft(rule)
            const dirty = draft.max !== rule.max || getWindowMs(draft) !== rule.windowMs
            return (
              <article className="rate-limit-card" key={rule.key}>
                <header>
                  <div><span>{rule.key}</span><h2>{rule.label}</h2></div>
                  <Tag color={rule.source === 'database' ? 'blue' : rule.source === 'environment' ? 'gold' : 'default'}>
                    {SOURCE_LABELS[rule.source]}
                  </Tag>
                </header>
                <p className="rate-limit-card__description">{rule.description}</p>
                <div className="rate-limit-card__editor" aria-label={`${rule.label}限流规则`}>
                  <label>
                    <span>最多请求</span>
                    <InputNumber
                      min={1}
                      max={100000}
                      precision={0}
                      disabled={readOnly}
                      value={draft.max}
                      onChange={(value) => updateDraft(rule.key, { max: value || 1 })}
                    />
                  </label>
                  <strong aria-hidden="true">/</strong>
                  <label>
                    <span>统计时间</span>
                    <InputNumber
                      min={draft.unit === 'ms' ? 100 : 1}
                      precision={0}
                      disabled={readOnly}
                      value={draft.duration}
                      onChange={(value) => updateDraft(rule.key, { duration: value || 1 })}
                    />
                  </label>
                  <Select
                    aria-label="时间单位"
                    disabled={readOnly}
                    value={draft.unit}
                    options={UNIT_OPTIONS.map(({ value, label }) => ({ value, label }))}
                    onChange={(unit) => updateDraft(rule.key, { unit })}
                  />
                </div>
                <footer>
                  <span>当前：{rule.max} 次 / {createDraft(rule).duration} {UNIT_OPTIONS.find((item) => item.value === createDraft(rule).unit)?.label}</span>
                  {!readOnly && (
                    <div>
                      <Button
                        icon={<UndoOutlined />}
                        disabled={rule.source !== 'database' || savingKey !== null}
                        onClick={() => resetRule(rule)}
                      >恢复默认</Button>
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        disabled={!dirty || savingKey !== null}
                        loading={savingKey === rule.key}
                        onClick={() => void saveRule(rule)}
                      >保存并生效</Button>
                    </div>
                  )}
                </footer>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
