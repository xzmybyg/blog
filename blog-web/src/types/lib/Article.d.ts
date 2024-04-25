export type Article = {
  readonly id: number
  title: string
  description?: string
  createTime?: Date
  topping?: boolean
  label?: string[]
}

export type CardProps = Article & {
  addClassName: string | string[];
  onClick?: Function;
};
