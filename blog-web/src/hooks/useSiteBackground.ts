import { getSiteBackgroundInfo, getSiteBackgroundUrl, type SiteBackgroundType } from '@/apis'

const defaultBackground = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}banner.jpg`

export default function useSiteBackground(type: SiteBackgroundType) {
  const [backgroundUrl, setBackgroundUrl] = useState(defaultBackground)

  useEffect(() => {
    let active = true
    let image: HTMLImageElement | null = null

    getSiteBackgroundInfo(type)
      .then((response) => {
        if (!active || !response.data.exists) {
          if (active) setBackgroundUrl(defaultBackground)
          return
        }

        const customBackground = getSiteBackgroundUrl(type, response.data.updatedAt)
        image = new Image()
        image.onload = () => {
          if (active) setBackgroundUrl(customBackground)
        }
        image.onerror = () => {
          if (active) setBackgroundUrl(defaultBackground)
        }
        image.src = customBackground
      })
      .catch(() => {
        if (active) setBackgroundUrl(defaultBackground)
      })

    return () => {
      active = false
      if (image) {
        image.onload = null
        image.onerror = null
      }
    }
  }, [type])

  return backgroundUrl
}
