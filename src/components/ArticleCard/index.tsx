import Style from "./index.module.scss";
import png404 from "@/assets/404.png";
import type { CardProps } from "@/types";

function ArticleCard(props: CardProps) {
  const { addClassName } = props;

  return (
    <div className={`${Style.articleCard} ${Style[addClassName as string]}`}>
      <img src={png404} />
      <div className={Style.articleContent}>
        <p className={Style.articleTitle}>{props.title || "文章标题"}</p>
        <div>
          <div className={Style.articleLabel}>
            {props.topping ? <Tag color="#87d068">置顶</Tag> : <></>}
            {props.createTime ? <span></span> : <></>}
            {props.label ? (
              props.label.map(item => {
                return (
                  <Tag key={item} color="#2db7f5">
                    {item}
                  </Tag>
                );
              })
            ) : (
              <></>
            )}
          </div>
          <div>{props.description || "文章简述"}</div>
        </div>
      </div>
    </div>
  );
}

export default ArticleCard;
