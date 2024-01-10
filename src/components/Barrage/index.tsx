import "./idnex.scss";

interface Comment {
  id: number;
  text: string;
}

interface Barrage {
  comment: Comment;
  top: number;
}

function BarrageComponent({ comments }: { comments: Comment[] }) {
  const [barrages, setBarrages] = useState<Barrage[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const comment = comments[Math.floor(Math.random() * comments.length)];
      const top = Math.random() * 80 + 10; // 随机位置
      const barrage: Barrage = { comment, top };
      setBarrages(barrages => [...barrages, barrage]);
    }, 1000);

    return () => clearInterval(interval);
  }, [comments]);

  return (
    <div>
      {barrages.map((barrage, index) => (
        <div key={index} className="barrage" style={{ top: `${barrage.top}%` }}>
          {barrage.comment.text}
        </div>
      ))}
    </div>
  );
}

export default BarrageComponent;
