// import { createBrowserRouter } from "react-router-dom";
import Article from "@/pages/Article";
import User from "@/pages/User";
import TheLink from "@/pages/TheLink";
import Label from "@/pages/Label";

const routerList = [
  {
    path: "/",
    element: <Article />,
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
];
export default routerList;