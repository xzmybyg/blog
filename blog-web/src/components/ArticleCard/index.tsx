//第三方库
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { BookOutlined, TagOutlined, PushpinOutlined } from '@ant-design/icons'
//样式引入
import Style from './index.module.scss'

const { articleCard, articleInfo, articleContent, articleTitle, articleTime, articleLabel, articleDescription } = Style

function ArticleCard(props: CardProps) {
  const { id, title, topping, createTime, label, topicName, description, addClassName,banner } = props
  const defaultBanner = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}banner.jpg`
  const optimizedBanner = banner && banner !== '404'
    ? `https://filespace.xzmybyg.cn/images/${banner}?imageMogr2/thumbnail/960x/format/webp/quality/78`
    : defaultBanner
  const [bannerSrc, setBannerSrc] = useState(
    optimizedBanner,
  )
  return (
    <article className={`${articleCard} ${addClassName && Style[addClassName as string]}`}>
      <Link className={Style.articleImageWrap} to={`/topic/${id}`} aria-label={`阅读文章：${title}`}>
        <img
          src={bannerSrc}
          alt={title || '文章封面'}
          loading="lazy"
          decoding="async"
          onError={() => {
            if (bannerSrc !== defaultBanner) {
              setBannerSrc(defaultBanner)
            }
          }}
        />
      </Link>
      <div className={articleContent}>
        <h3 className={articleTitle}>
          <Link to={`/topic/${id}`}>{title || '文章标题'}</Link>
          {createTime && (
            <time className={articleTime} dateTime={dayjs(createTime).format('YYYY-MM-DD')}>
              {dayjs(createTime).format('YYYY-MM-DD')}
            </time>
          )}
        </h3>
        <div className={articleInfo}>
          <div className={articleLabel}>
            {topping && (
              <Tag color="#87d068" icon={<PushpinOutlined />}>
                置顶
              </Tag>
            )}

            {topicName && (
              <Tag color="blue" icon={<BookOutlined />}>
                专题 · {topicName}
              </Tag>
            )}

            {Array.isArray(label) &&
              label?.map((item) => {
                return (
                  <Tag key={item} color="#2db7f5" icon={<TagOutlined />}>
                    {item}
                  </Tag>
                )
              })}
          </div>
          <div className={articleDescription}>{description || '暂无文章描述，等待后续添加。'}</div>
        </div>
        <Link className={Style.readMore} to={`/topic/${id}`}>阅读全文 <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  )
}

const MoemoArticleCard = memo(ArticleCard)

export default MoemoArticleCard
