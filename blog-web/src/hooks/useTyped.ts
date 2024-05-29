import Typed, { TypedOptions } from 'typed.js'

export function useTyped(strings: string[], extra?: TypedOptions) {
  const el = useRef<HTMLDivElement | null>(null)
  const typed = useRef<Typed | null>(null)
  useEffect(() => {
    const options = {
      strings,
      typeSpeed: 100,
      backSpeed: 60,
      ...extra,
    }
    typed.current = new Typed(el.current || '', options)
    return () => {
      typed.current?.destroy()
    }
  }, [strings])

  return el
}
