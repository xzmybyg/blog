declare type baseRouter = {
  path: string;
  icon?: React.ReactElement;
  name: string;
  visible?: boolean;
  children?: tRouter[];
  meta?: any;
  showOnNav?: boolean;
};

declare type RouterType = baseRouter & {
  element: React.ReactElement;
  redirect?: string;
};


