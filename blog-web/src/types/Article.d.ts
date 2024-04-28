declare type Article = {
  readonly id: number;
  title: string;
  description?: string;
  createTime?: Date;
  topping?: boolean;
  label?: string[];
};

declare type CardProps = Article & {
  addClassName: string | string[];
  onClick?: () => void;
};
