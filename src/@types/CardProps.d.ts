type CardProps = {
  addClassName: string | string[];
  title: string;
  ID: number;
  topping?: boolean;
  createTime?: Date;
  description?: string;
  label?: string[];
  onClick?: Function;
};

export default CardProps;
