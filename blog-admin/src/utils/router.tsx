import Home from "@/pages/Home";
import Article from "@/pages/Article";
import User from "@/pages/User";
import TheLink from "@/pages/TheLink";
import Label from "@/pages/Label";
import Comment from "@/pages/Comment";
import MessageAdmin from "@/pages/MessageAdmin";
import NotFound from "@/pages/NotFound";
import AddArticle from "@/pages/Article/AddArticle/AddArticle";
import {
  DesktopOutlined,
  FileOutlined,
  HomeOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

const routerList = [
  {
    path: "/",
    element: <Home />,
    name: "首页",
    icon: <HomeOutlined />,
    meta: {
      showOnMenu: true,
    },
  },
  {
    path: "/login",
    element: <Login />,
    name: "登录",
    icon: <PieChartOutlined />,
    meta: {
      showOnMenu: true,
    },
  },
  {
    path: "/article",
    element: <Article />,
    name: "文章管理",
    icon: <PieChartOutlined />,
    meta: {
      showOnMenu: true,
    },
    children: [],
  },
  {
    path: "/addArticle",
    element: <AddArticle />,
    name: "新建文章",
    icon: <PieChartOutlined />,
    meta: {
      showOnMenu: true,
    },
  },
  {
    path: "/user",
    element: <User />,
    name: "用户管理",
    icon: <DesktopOutlined />,
    meta: {
      showOnMenu: true,
    },
  },
  {
    path: "/link",
    element: <TheLink />,
    name: "友链管理",
    icon: <UserOutlined />,
    meta: {
      showOnMenu: true,
    },
  },
  {
    path: "/label",
    element: <Label />,
    name: "标签管理",
    icon: <TeamOutlined />,
    meta: {
      showOnMenu: true,
    },
  },
  {
    path: "/comment",
    element: <Comment />,
    name: "评论管理",
    icon: <FileOutlined />,
    meta: {
      showOnMenu: true,
    },
  },
  {
    path: "/message",
    element: <MessageAdmin />,
    name: "留言管理",
    icon: <FileOutlined />,
    meta: {
      showOnMenu: true,
    },
  },
  {
    path: "*",
    element: <NotFound />,
    name: "404",
    meta: {
      showOnMenu: false,
    },
  },
];
export default routerList;
