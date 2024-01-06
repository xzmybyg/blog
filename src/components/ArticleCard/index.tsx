import png404 from "@/assets/404.png";
//第三方库
import dayjs from "dayjs";
import { TagOutlined, EditOutlined, PushpinOutlined } from "@ant-design/icons";
//type引入
import type { CardProps } from "@/types";
//样式引入
import Style from "./index.module.scss";

function ArticleCard(props: CardProps) {
  const { title, topping, createDate, label, description, addClassName } =
    props;

  return (
    <div className={`${Style.articleCard} ${Style[addClassName as string]}`}>
      <img src={png404} />
      <div className={Style.articleContent}>
        <p className={Style.articleTitle}>{title || "文章标题"}</p>
        <div>
          <div className={Style.articleLabel}>
            {topping ? (
              <Tag color="#87d068" icon={<PushpinOutlined />}>
                置顶
              </Tag>
            ) : (
              <></>
            )}
            {createDate && (
              <Tag color="#f50" icon={<EditOutlined />}>
                {dayjs(props.createDate).format("YYYY-MM-DD")}
              </Tag>
            )}
            {label &&
              label.map(item => {
                return (
                  <Tag key={item} color="#2db7f5" icon={<TagOutlined />}>
                    {item}
                  </Tag>
                );
              })}
          </div>
          <div>{description || "文章简述"}</div>
        </div>
      </div>
    </div>
  );
}

const MoemoArticleCard = memo(ArticleCard);

export default MoemoArticleCard;
