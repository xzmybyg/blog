import cardStyle from "./cardStyle.module.scss";
import png404 from "@/assets/404.png";
import CardProps from "@/@types/CardProps";

function ArticleCard(props: CardProps) {
  const { addClassName } = props;

  return (
    <div
      className={`${cardStyle.articleCard} ${
        cardStyle[addClassName as string]
      }`}
    >
      <img src={png404} />
      <div className={cardStyle.articleContent}>
        <p className={cardStyle.articleTitle}>{props.title || "文章标题"}</p>
        <div>
          <div className={cardStyle.articleLabel}>
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
