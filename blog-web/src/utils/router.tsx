const Home = lazy(() => import("@/pages/Home"));
const Article = lazy(() => import("@/pages/Article/index"));
const Topic = lazy(() => import("@/pages/Topic/index"));
const About = lazy(() => import("@/pages/About/index"));
const TheLink = lazy(() => import("@/pages/TheLink/index"));
const Message = lazy(() => import("@/pages/Message/index"));
const NotFound = lazy(() => import("@/pages/NotFound/index"));

import {
  HomeOutlined,
  FileTextOutlined,
  UserOutlined,
  LinkOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const routerList: RouterType[] = [
  {
    path: "/",
    element: <Home />,
    name: "首页",
    icon: <HomeOutlined />,
  },
  {
    path: "/article",
    element: <Article />,
    name: "文章",
    icon: <FileTextOutlined />,
  },
  {
    path: "/topic/:id",
    element: <Topic />,
    name: "话题",
    showOnNav: false,
  },
  {
    path: "/about",
    element: <About />,
    icon: <UserOutlined />,
    name: "关于",
  },
  {
    path: "/link",
    element: <TheLink />,
    icon: <LinkOutlined />,
    name: "友链",
  },
  {
    path: "/message",
    element: <Message />,
    icon: <MessageOutlined />,
    name: "留言",
  },
  // {
  //   path: "/admin/",
  //   element: <Admin />,
  //   name: "管理",
  //   showOnNav: false,
  //   children: [
  //     {
  //       path: "article",
  //       element: <AdminArticle />,
  //       name: "文章管理",
  //     },
  //     {
  //       path: "topic/:id",
  //       element: <Topic />,
  //       name: "话题管理",
  //     },
  //     {
  //       path: "user",
  //       element: <AdminUser />,
  //       name: "用户管理",
  //     },
  //     {
  //       path: "link",
  //       element: <AdminLink />,
  //       name: "友链管理",
  //     },
  //     {
  //       path: "comment",
  //       element: <AdminComment />,
  //       name: "留言管理",
  //     },
  //     {
  //       path: "label",
  //       element: <AdminLabel />,
  //       name: "标签管理",
  //     },
  //   ],
  // },
  {
    path: "*",
    element: <NotFound />,
    name: "404",
    showOnNav: false,
  },
];

export default routerList;
