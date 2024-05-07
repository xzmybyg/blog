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
      dataIndex: "topping",
      key: "topping",
      render: (topping, record) => (
        <Switch
          checkedChildren="是"
          unCheckedChildren="否"
          checked={topping}
          onChange={(checked) => {
            updateArticle({
              id: record.id,
              topping: checked,
            }).then(() => {
              setData(
                data.map((item) =>
                  item.id === record.id ? { ...item, topping: checked } : item
                )
              );
            });
          }}
        />
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      render: (time) => <>{dayjs(time).format("YYYY-MM-DD")}</>,
    },
    {
      title: "隐藏",
      dataIndex: "hidden",
      key: "hidden",
      render: (hidden, record) => (
        <Switch
          checkedChildren="显示"
          unCheckedChildren="隐藏"
          checked={hidden}
          onChange={(checked) => {
            updateArticle({
              id: record.id,
              hidden: checked,
            }).then(() => {
              setData(
                data.map((item) =>
                  item.id === record.id ? { ...item, hidden: checked } : item
                )
              );
            });
          }}
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
      setData(res.data);
    });
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);

  const showModal = (article: Article) => {
    setCurrentArticle(article);

    setIsModalOpen(true);
  };

  const handleOk = () => {
    updateArticle(currentArticle).then((res) => {
      console.log(res);
    });

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
            <Input
              value={currentArticle?.title}
              onChange={(e) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  title: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="文章内容">
            <Input.TextArea
              value={currentArticle?.article}
              onChange={(e) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  article: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="标签">
            <Input
              value={currentArticle?.label}
              onChange={(e) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  label: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="文章描述">
            <Input.TextArea
              value={currentArticle?.description}
              onChange={(e) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  description: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="封面">
            <Input
              value={currentArticle?.banner}
              onChange={(e) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  banner: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="置顶">
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              defaultChecked={currentArticle?.topping}
              onChange={(checked) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  topping: checked,
                })
              }
            />
          </Form.Item>
          <Form.Item label="隐藏">
            <Switch
              checkedChildren="显示"
              unCheckedChildren="隐藏"
              defaultChecked={currentArticle?.hidden}
              onChange={(checked) =>
                setCurrentArticle({
                  ...(currentArticle as Article),
                  hidden: checked,
                })
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
