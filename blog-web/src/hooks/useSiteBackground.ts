import { getSiteBackgroundUrl, type SiteBackgroundType } from '@/apis'

const defaultBackground = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}banner.jpg`

export default function useSiteBackground(type: SiteBackgroundType) {
  const [backgroundUrl, setBackgroundUrl] = useState(defaultBackground)

  useEffect(() => {
    const image = new Image()
    image.onload = () => setBackgroundUrl(getSiteBackgroundUrl(type))
    image.src = getSiteBackgroundUrl(type)
    return () => {
      image.onload = null
    }
  }, [type])

  return backgroundUrl
}
