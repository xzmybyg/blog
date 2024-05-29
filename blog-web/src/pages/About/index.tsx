import './index.scss'

function About() {
  return (
    <div id="aboutpage" className="pages">
      <Card className="card" style={{ position: 'relative' }}>
        <img className="animal_avatars" src="/animal_avatars.png" alt="" />

        <Avatar
          className="avatar jello"
          src="/blog-icon.jpg"
          size={{ xs: 40, sm: 40, md: 40, lg: 64, xl: 80, xxl: 100 }}
          style={{
            boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
          }}
        />
        <h2>关于我</h2>
        <Divider className="divider" />
        <ol>
          <li>主要做前端开发，做过一段时间C++全栈</li>
          <li>目前坐标北京</li>
          <li>平时喜欢写一些小项目，通过新媒体了解一些前沿的技术</li>
          <li>邮箱：1277215827@qq.com</li>
        </ol>
        <h2>技术栈</h2>
        <Divider className="divider" />
        <ol>
          <li>前端：React、Vue、Typescript</li>
          <li>后端：Node、Express、C++</li>
          <li>数据库：MySQL、MongoDB</li>
          <li>其他：Webpack、Vite</li>
        </ol>
        <h2>关于本站</h2>
        <Divider className="divider" />
        <ul>
          <li>博客搭建</li>
          <li>前端使用React、Vite、Ant Design、SCSS搭建</li>
          <li>后端使用Node.js、Express搭建</li>
        </ul>
      </Card>
    </div>
  )
}

export default About
