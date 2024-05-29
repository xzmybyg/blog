declare type baseRouter = {
  path: string
  icon?: React.ReactElement | string
  name: string
  visible?: boolean
  children?: tRouter[]
  meta?: { [key: string]: any }
  showOnNav?: boolean
}

declare type RouterType = baseRouter & {
  component: React.ComponentType
  redirect?: string
}
