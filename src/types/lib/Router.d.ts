type baseRouter = {
  path: string;
  icon?: React.ReactElement;
  name: string;
  visible?: boolean;
  children?: tRouter[];
  meta?: any;
  showOnNav?: boolean;
};

type RouterType = baseRouter & {
  element: React.ReactElement;
  redirect?: string;
};

export { RouterType };
