//第三方库
import dayjs from "dayjs";
import { TagOutlined, EditOutlined, PushpinOutlined } from "@ant-design/icons";
//type引入
import type { CardProps } from "@/types";
//样式引入
import Style from "./index.module.scss";

import png404 from "@/assets/404.png";

function ArticleCard(props: CardProps) {
  const { id, title, topping, createTime, label, description, addClassName } =
    props
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate(`/topic/${id}`);
  };

  return (
    <div className={`${Style.articleCard} ${Style[addClassName as string]}`}>
      <img src={png404} onClick={handleNavigate} />
      <div className={Style.articleContent}>
        <p onClick={handleNavigate} className={Style.articleTitle}>
          {title || "文章标题"}
        </p>
        <div>
          <div className={Style.articleLabel}>
            {topping && (
              <Tag color="#87d068" icon={<PushpinOutlined />}>
                置顶
              </Tag>
            )}
            {createTime && (
              <Tag color="#f50" icon={<EditOutlined />}>
                {dayjs(props.createTime).format("YYYY-MM-DD")}
              </Tag>
            )}
            {label?.map(item => {
              return (
                <Tag key={item} color="#2db7f5" icon={<TagOutlined />}>
                  {item}
                </Tag>
              )
            })}
          </div>
          <div>{description || "文章简述"}</div>
        </div>
      </div>
    </div>
  )
}

const MoemoArticleCard = memo(ArticleCard);

export default MoemoArticleCard;
