import MdEditor from "for-editor"

export default function AddArticle() {
  const [markdown, setMarkdown] = useState("")

  const handleChange = (value) => {
    setMarkdown(value)
  }

  const handleSave = (value) => {
    console.log(value, article)
    uploadArticleFile({ content: value, title: article })
      .then(() => {
        message.success("上传成功")
      })
      .catch(() => {
        message.error("上传失败")
      })
  }

  const handleAddImg = (file) => {
    console.log(file)
  }

  const toolbar = {
    h1: true, // h1
    h2: true, // h2
    h3: true, // h3
    h4: true, // h4
    img: true, // 图片
    link: true, // 链接
    code: true, // 代码块
    preview: true, // 预览
    expand: true, // 全屏
    /* v0.0.9 */
    undo: true, // 撤销
    redo: true, // 重做
    save: true, // 保存
    /* v0.2.3 */
    subfield: true, // 单双栏模式
  }

  const [article, setArticle] = useState("")

  return (
    <div id="addArticle">
      <Form>
        <Form.Item label="文章标题">
          <Input
            type="text"
            value={article}
            onChange={(e) => setArticle(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <MdEditor
            placeholder="请输入Markdown文本"
            height={"600px"}
            lineNum={1}
            toolbar={toolbar}
            value={markdown}
            subfield={true}
            preview={true}
            onChange={handleChange}
            onSave={handleSave}
            addImg={handleAddImg}
          />
        </Form.Item>
      </Form>
    </div>
  )
}
