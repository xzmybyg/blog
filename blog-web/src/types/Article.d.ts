declare type Article = {
  readonly id: number
  title: string
  description?: string
  createTime?: Date
  topping?: boolean
  label?: string[] | string
  labelIds?: number[]
  topicId?: number | null
  topicName?: string | null
  topicOrder?: number
  banner?: string
  hidden?: boolean
  article?: string
}

declare type ArticleNavigationItem = {
  id: number
  title: string
}

declare type ArticleNavigation = {
  topic: { id: number; name: string } | null
  position: number | null
  total: number
  previous: ArticleNavigationItem | null
  next: ArticleNavigationItem | null
}

declare type ArticleTopic = {
  id: number
  name: string
  description?: string
  createTime?: Date
  articleCount?: number
}

declare type CardProps = Article & {
  addClassName: string | string[]
  onClick?: () => void
}
