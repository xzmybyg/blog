import type { Comment, Barrage } from "@/types"
import "./index.scss"

function BarrageComponent({ comments }: { comments: Comment[] }) {
  const [barrages, setBarrages] = useState<Barrage[]>([])

  useEffect(() => {
    // 生成所有的弹幕
    const newBarrages = comments.slice(0, 10).map(comment => {
      const top = Math.random() * 80 + 10
      const delay = Math.random() * 5
      return { comment, top, delay }
    })

    setBarrages(newBarrages)
  }, [comments])
  
  const handleAnimationEnd = (index: number) => {

    // 从 barrages 数组中移除弹幕
    setBarrages(barrages => barrages.filter((_, i) => i !== index))
  }

  return (
    <div>
      {barrages.map((barrage, index) => {
        return (
          <div
            key={index}
            className="barrage"
            style={{
              top: `${barrage.top}%`,
              animationDelay: `${barrage.delay}s`, // 设置动画延迟
              visibility: "hidden", // 初始时设置为不可见
            }}
            onAnimationStart={() => {
              // 动画开始时设置为可见
              const element = document.querySelector(
                `.barrage:nth-child(${index + 1})`
              ) as HTMLElement
              if (element) {
                element.style.visibility = "visible"
              }
            }}
            onAnimationEnd={() => handleAnimationEnd(index)}
          >
            <img src="/blog-icon.jpg" alt="" />
            {barrage.comment.content}
          </div>
        )
      })}
    </div>
  )
}

export default BarrageComponent
