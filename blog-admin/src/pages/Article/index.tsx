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
      render: (record) => (
        <Space>
          <Button onClick={() => showModal(record)}>编辑</Button>
          <Button onClick={() => delArticle(record.id)}>删除</Button>
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);

  const showModal = (article: Article) => {
    setCurrentArticle(article);
    console.log(article);

    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const delArticle = (id: number) => {
    deleteArticle(id).then((res) => {
      console.log(res);
    });
  };

  return (
    <div>
      <div style={{ width: "100%", height: "100%" }}>
        <Table
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={data}
          size="large"
          style={{ fontSize: "18px", lineHeight: "2" }}
        />
      </div>
      <Modal
        title="编辑文章"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
      >
        <Form labelCol={{ span: 4 }}>
          <Form.Item label="文章标题">
            <Input value={currentArticle?.title} />
          </Form.Item>
          <Form.Item label="文章内容">
            <Input.TextArea value={currentArticle?.article} />
          </Form.Item>
          <Form.Item label="标签">
            <Input value={currentArticle?.label} />
          </Form.Item>
          <Form.Item label="文章描述">
            <Input.TextArea value={currentArticle?.description} />
          </Form.Item>
          <Form.Item label="封面">
            <Input value={currentArticle?.banner} />
          </Form.Item>
          <Form.Item label="置顶">
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              defaultChecked={currentArticle?.topping}
            />
          </Form.Item>
          <Form.Item label="隐藏">
            <Switch
              checkedChildren="显示"
              unCheckedChildren="隐藏"
              defaultChecked={currentArticle?.hidden}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
