import { useTyped } from "@/hooks";

function Message() {
  const el = useTyped(["我是心中没有白月光,<br/>欢迎来到我的博客", ""], {
    loop: true,
  });

  return (
    <div>
      <span ref={el}></span>
      {/* <BarrageComponent comments={comments} /> */}
    </div>
  );
}

export default Message;
