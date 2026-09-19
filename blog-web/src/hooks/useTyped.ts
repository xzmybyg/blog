import type { TypedOptions } from 'typed.js'

export function useTyped(strings: string[], extra?: TypedOptions) {
  const el = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    let active = true
    let typed: { destroy: () => void } | null = null
    const start = () => {
      void import('typed.js').then(({ default: Typed }) => {
        if (!active) return
        typed = new Typed(el.current || '', {
          strings,
          typeSpeed: 100,
          backSpeed: 60,
          ...extra,
        })
      })
    }
    const supportsIdleCallback = typeof window.requestIdleCallback === 'function'
    const idleId = supportsIdleCallback
      ? window.requestIdleCallback(start, { timeout: 1200 })
      : window.setTimeout(start, 300)

    return () => {
      active = false
      if (supportsIdleCallback) window.cancelIdleCallback(idleId)
      else window.clearTimeout(idleId)
      typed?.destroy()
    }
  }, [strings])

  return el
}
