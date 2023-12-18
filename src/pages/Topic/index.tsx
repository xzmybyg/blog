import ReactMarkdown from "react-markdown";
import Style from "./index.module.scss";
import MarkdownNavbar from "markdown-navbar";

import "github-markdown-css";
import "markdown-navbar/dist/navbar.css";

import { getTopic } from "@/apis";

type TopicProps = {
  id: string;
};

export default function Topic() {
  const { id } = useParams<TopicProps>();

  const [mdContent, setMdContent] = useState("");

  useEffect(() => {
    getTopic(id as string).then(res => {
      setMdContent(res.data);
    });
  }, []);

  return (
    <>
      <div className={`${Style.topic} pages`}>
        <div className={`${Style["topic-wrap"]}`}>
          <ReactMarkdown
            className={`${Style["markdown-body"]} markdown-body`}
            children={mdContent}
          />
        </div>

        <MarkdownNavbar
          className={`${Style["markdown-Navbar"]} markdown-Navbar`}
          source={mdContent}
          headingTopOffset={80}
          ordered={false}
        />
      </div>
    </>
  );
}
