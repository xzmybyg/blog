import Meta from "antd/es/card/Meta";

const tagList = [
  {
    label: "react",
    color: "#108ee9",
  },
  {
    label: "Vue",
    color: "#41b883",
  },
  {
    label: "TypeScript",
    color: "#3178c6",
  },
  {
    label: "Node",
    color: "#108ee9",
  },
  {
    label: "博客",
    color: "#108ee9",
  },
];

export default function LabelCard() {
  return (
    <Card style={{ width: 300 }}>
      <Meta style={{ marginBottom: 20 }} title={"标签分类"} />
      <Space wrap={true}>
        {tagList.map(item => (
          <Tag key={item.label} color={item.color}>
            {item.label}
          </Tag>
        ))}
      </Space>
    </Card>
  );
}
