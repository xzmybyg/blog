export type ClientErrorReport = {
  message: string
  stack?: string
  route?: string
  method?: string
  statusCode?: number
  context?: Record<string, string>
}

const REPORT_INTERVAL = 60 * 1000
const recentReports = new Map<string, number>()
let installed = false

function reportingEnabled() {
  const configured = import.meta.env.VITE_ERROR_REPORTING_ENABLED
  return configured === undefined ? import.meta.env.PROD : configured === 'true'
}

export function reportClientError(report: ClientErrorReport) {
  if (!reportingEnabled() || !report.message) return
  const message = report.message.slice(0, 1000)
  const stack = report.stack?.slice(0, 12000)
  const route = (report.route || window.location.pathname).split('?')[0].slice(0, 255)
  const context = report.context
    ? Object.fromEntries(Object.entries(report.context).map(([key, value]) => [key, value.slice(0, 2000)]))
    : undefined
  const fingerprint = [message, route, report.statusCode || '', stack?.split('\n')[0] || ''].join('|')
  const now = Date.now()
  if (now - (recentReports.get(fingerprint) || 0) < REPORT_INTERVAL) return
  recentReports.set(fingerprint, now)
  if (recentReports.size > 500) recentReports.delete(recentReports.keys().next().value!)

  void fetch('/api/error-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...report, message, stack, route, context }),
    keepalive: true,
  }).catch(() => undefined)
}

export function installGlobalErrorMonitoring() {
  if (installed || typeof window === 'undefined') return
  installed = true

  window.addEventListener('error', (event) => {
    reportClientError({
      message: event.message || 'Unhandled browser error',
      stack: event.error instanceof Error ? event.error.stack : undefined,
      context: { browser: navigator.userAgent },
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    reportClientError({
      message: reason instanceof Error ? reason.message : String(reason || 'Unhandled promise rejection'),
      stack: reason instanceof Error ? reason.stack : undefined,
      context: { browser: navigator.userAgent },
    })
  })
}
