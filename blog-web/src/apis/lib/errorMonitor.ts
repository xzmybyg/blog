export type ErrorEvent = {
  id: number
  fingerprint: string
  source: 'client' | 'server' | 'process'
  level: 'error' | 'fatal'
  message: string
  stack: string | null
  route: string | null
  method: string | null
  status_code: number | null
  request_id: string | null
  user_agent: string | null
  context_json: string | null
  occurrences: number
  first_seen_at: string
  last_seen_at: string
  resolved: number
  resolved_at: string | null
}

export type ErrorMonitorResponse = {
  items: ErrorEvent[]
  summary: { total: number; openCount: number; occurrences: number }
}

export function getErrorEvents(status: 'open' | 'resolved' | 'all' = 'open') {
  return axiosInstance.get<ErrorMonitorResponse>('/error-monitor', { params: { status } })
}

export function resolveErrorEvent(id: number, resolved: boolean) {
  return axiosInstance.put(`/error-monitor/${id}/resolve`, { resolved })
}

export function deleteErrorEvent(id: number) {
  return axiosInstance.delete(`/error-monitor/${id}`)
}
