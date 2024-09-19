//第三方库
import dayjs from 'dayjs'
import { TagOutlined, PushpinOutlined } from '@ant-design/icons'
//样式引入
import Style from './index.module.scss'

const { articleCard, articleInfo, articleContent, articleTitle, articleTime, articleLabel, articleDescription } = Style

function ArticleCard(props: CardProps) {
  const { id, title, topping, createTime, label, description, addClassName,banner } = props
  const navigate = useNavigate()
  const handleNavigate = () => {
    navigate(`/topic/${id}`)
  }

  return (
    <div className={`${articleCard} ${addClassName && Style[addClassName as string]}`}>
      <img src={`http://filespace.xzmybyg.cn/images/${banner}`} onClick={handleNavigate} />
      <div className={articleContent}>
        <p onClick={handleNavigate} className={articleTitle}>
          {title || '文章标题'}
          {createTime && (
            <span className={articleTime} color="#f50">
              {dayjs(createTime).format('YYYY-MM-DD')}
            </span>
          )}
        </p>
        <div className={articleInfo}>
          <div className={articleLabel}>
            {topping && (
              <Tag color="#87d068" icon={<PushpinOutlined />}>
                置顶
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
      </div>
    </div>
  )
}

const MoemoArticleCard = memo(ArticleCard)

export default MoemoArticleCard
