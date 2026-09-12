const lastRequestTimes = new Map<string, number>()

export function isRequestThrottled(key: string, intervalMs: number) {
  const now = Date.now()
  const lastRequestTime = lastRequestTimes.get(key) || 0
  if (now - lastRequestTime < intervalMs) return true

  lastRequestTimes.set(key, now)
  return false
}
