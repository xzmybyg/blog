import { ColorPicker } from "antd";
import dayjs from "dayjs";

export default function LabelAdmin() {
  const [labelList, setLabelList] = useState<Label[]>([]);
  useEffect(() => {
    getLabelList().then((res) => {
      setLabelList(res.data);
    });
  }, []);

  const columns = [
    {
      title: "id",
      dataIndex: "id",
      key: "id",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "标签名",
      dataIndex: "label",
      key: "label",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "颜色",
      dataIndex: "color",
      key: "color",
      render: (color) => (
        <span style={{ backgroundColor: color, color: "#fff" }}>{color}</span>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      render: (time) => <>{dayjs(time).format("YYYY-MM-DD")}</>,
    },
    {
      title: "操作",
      key: "action",
      render: (record) => (
        <Space>
          <Button
            onClick={() => {
              setAction(false);
              showModal(record);
            }}
          >
            编辑
          </Button>
          <Button onClick={() => delLabel(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  const [addOrEditLabel, setAction] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<Label | null>(null);

  const showModal = (label: Label) => {
    setCurrentLabel({
      ...label,
      color: label.color,
    });

    setIsModalOpen(true);
  };

  const handleAddLabel = () => {
    addLabel(currentLabel).then((res) => {
      console.log(res.data);

      setLabelList([...labelList, res.data]);
    });
  };

  const handleOk = () => {
    if (addOrEditLabel) {
      handleAddLabel();
    } else {
      updateLabel(currentLabel).then(() => {
        setLabelList(
          labelList.map((item) =>
            item.id === currentLabel?.id ? currentLabel : item
          )
        );
      });
    }

    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const delLabel = (id: number) => {
    deleteLabel(id).then(() => {
      setLabelList(labelList.filter((item) => item.id !== id));
    });
  };

  return (
    <div>
      <Button
        onClick={() => {
          setAction(true);
          showModal({ id: null, label: "", color: "#fff" });
        }}
      >
        添加标签
      </Button>

      <div style={{ width: "100%", height: "100%" }}>
        <Table
          rowKey={(record) => record.id as number}
          columns={columns}
          dataSource={labelList}
          size="large"
          style={{ fontSize: "18px", lineHeight: "2" }}
        />
      </div>

      <Modal
        title={addOrEditLabel ? "添加标签" : "编辑标签"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
      >
        <Form labelCol={{ span: 4 }}>
          <Form.Item label="标签名">
            <Input
              value={currentLabel?.label}
              onChange={(e) =>
                setCurrentLabel({
                  ...(currentLabel as Label),
                  label: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="颜色">
            <ColorPicker
              value={currentLabel?.color}
              onChange={(_, hex) => {
                setCurrentLabel({
                  ...(currentLabel as Label),
                  color: hex,
                });
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
