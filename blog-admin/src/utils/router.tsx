import Home from "@/pages/Home";
import Article from "@/pages/Article";
import User from "@/pages/User";
import TheLink from "@/pages/TheLink";
import Label from "@/pages/Label";
import Comment from "@/pages/Comment";

const routerList = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/article",
    element: <Article />,
  },
  {
    path: "/user",
    element: <User />,
  },
  {
    path: "/link",
    element: <TheLink />,
  },
  {
    path: "/label",
    element: <Label />,
  },
  {
    path: "comment",
    element: <Comment />,
    name: "留言管理",
  },
];
export default routerList;
