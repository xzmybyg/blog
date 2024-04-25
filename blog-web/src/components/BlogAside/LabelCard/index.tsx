import { Label } from "@/types";
import Meta from "antd/es/card/Meta";

export default function LabelCard() {
  const [labelList, setLabelList] = useState<Label[]>([]);
  useEffect(() => {
    getLabelList().then(res => {
      setLabelList(res.data);
    });
  }, []);
  return (
    <Card style={{ width: 300 }}>
      <Meta style={{ marginBottom: 20 }} title={"标签分类"} />
      <Space wrap={true}>
        {labelList.map(item => (
          <Tag key={item.label} color={item.color}>
            {item.label}
          </Tag>
        ))}
      </Space>
    </Card>
  );
}
