import { Button, Space, Table, Tag } from "antd";
import { useEffect } from "react";
import { getPageArticleList } from "@/apis";

export default function Article() {
  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "文章标题",
      dataIndex: "title",
      key: "title",
      render: (text) => <a>{text}</a>,
      width: 200,
    },
    {
      title: "文章内容",
      dataIndex: "article",
      key: "article",
    },
    {
      title: "label",
      key: "label",
      dataIndex: "label",
      render: (tags) => (
        <>
          {tags.map((tag) => {
            let color = tag.length > 5 ? "geekblue" : "green";
            if (tag === "loser") {
              color = "volcano";
            }
            return (
              <Tag color={color} key={tag}>
                {tag}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "封面",
      dataIndex: "banner",
      key: "banner",
      render: (banner) => <>{banner}</>,
    },
    {
      title: "置顶",
      dataIndex: "top",
      key: "top",
      render: (topping) => <>{topping ? "是" : "否"}</>,
    },
    {
      title: "创建时间",
      dataIndex: "createDate",
      key: "create_time",
      render: (time) => <>{time}</>,
    },
    {
      title: "隐藏",
      dataIndex: "hidden",
      key: "hidden",
      render: (hidden) => <>{hidden ? "是" : "否"}</>,
    },
    {
      title: "操作",
      key: "action",
      render: () => (
        <Space>
          <Button>编辑</Button>
          <Button>删除</Button>
        </Space>
      ),
    },
  ];
  const [data, setData] = useState([]);

  useEffect(() => {
    getPageArticleList({ pageSize: 10 }).then((res) => {
      console.log(res.data);
      setData(res.data);
    });
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Table
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={data}
        size="large"
        style={{ fontSize: "18px", lineHeight: "2" }}
      />
    </div>
  );
}
