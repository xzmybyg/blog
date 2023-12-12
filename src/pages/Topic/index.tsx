import ReactMarkdown from "react-markdown";

export default function Topic() {
  const { id } = useParams();

  const [mdContent, setMdContent] = useState("");

  useEffect(() => {
    axios
      .get("/api/topic/", {
        params: { id },
      })
      .then(res => {
        setMdContent(res.data);
      });
  }, []);

  return (
    <>
      <div className="pages">
        <ReactMarkdown children={mdContent} />
      </div>
    </>
  );
}
