//第三方库
import ReactMarkdown from "react-markdown";
import MarkdownNavbar from "markdown-navbar";
import { Card, Affix } from "antd";

//api引入
import { getTopic } from "@/apis";
//样式引入
import "github-markdown-css";
import "markdown-navbar/dist/navbar.css";
import "react-markdown-navbar/dist/style.css";
import Style from "./index.module.scss";

type TopicProps = {
  id: string;
};

export default function Topic() {
  const { topic, topicWrap, markdownBody, affixNavbar, NavbarCard, Navbar } =
    Style;
  const { id } = useParams<TopicProps>();

  const [mdContent, setMdContent] = useState("");

  useEffect(() => {
    getTopic(id as string).then(res => {
      setMdContent(res.data);
    });
  }, []);

  return (
    <div className={`${topic} pages`}>
      <div className={`${topicWrap}`}>
        <ReactMarkdown
          className={`${markdownBody} markdown-body`}
          children={mdContent}
        />
      </div>
      <Affix className={`${affixNavbar}`} offsetTop={88}>
        <Card className={`${NavbarCard}`}>
          <MarkdownNavbar
            className={`${Navbar} markdown-Navbar`}
            source={mdContent}
          />
        </Card>
      </Affix>
    </div>
  );
}
