import "./index.scss";

function Website() {
  return (
    <Card className="side" title="网站资讯" style={{ width: 300 }}>
      <Flex justify="space-between">
        <span>本站已运行：</span>
        <span>-----</span>
      </Flex>
      <Flex justify="space-between">
        <span>访问量：</span>
        <span>---</span>
      </Flex>
    </Card>
  );
}

export default Website;
