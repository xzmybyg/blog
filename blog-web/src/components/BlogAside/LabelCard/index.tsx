import Meta from 'antd/es/card/Meta'
import Style from '../index.module.scss'

export default function LabelCard() {
  const [labelList, setLabelList] = useState<Label[]>([])
  useEffect(() => {
    getLabelList().then((res) => {
      setLabelList(res.data)
    })
  }, [])
  return (
    <Card style={{ width: 300 }}>
      <Meta style={{ marginBottom: 20 }} title={'标签分类'} />
      <Space wrap={true}>
        {labelList.map((item) => (
          <Tag key={item.label} className={Style.labelTag}>
            {item.label}
          </Tag>
        ))}
      </Space>
    </Card>
  )
}
