import { Button, Space, Table, Tag } from "antd";
import { useEffect } from "react";
import { getPageArticleList } from "@/apis";
import dayjs from "dayjs";

export default function Article() {
  const columns = [
    {
      title: "id",
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
      title: "标签",
      key: "label",
      dataIndex: "label",
      render: (tags) => (
        <>
          <Tag key={tags}>{tags}</Tag>
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
      render: (topping) => (
        <Switch
          checkedChildren="是"
          unCheckedChildren="否"
          defaultChecked={topping}
        />
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createDate",
      key: "create_time",
      render: (time) => <>{dayjs(time).format("YYYY-MM-DD")}</>,
    },
    {
      title: "隐藏",
      dataIndex: "hidden",
      key: "hidden",
      render: (hidden) => (
        <Switch
          checkedChildren="显示"
          unCheckedChildren="隐藏"
          defaultChecked={hidden}
        />
      ),
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
  const [data, setData] = useState<Article[]>([]);

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
