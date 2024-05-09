import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.scss";
import { BrowserRouter as Router } from "react-router-dom";
import { ConfigProvider } from "antd";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Router>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#aaa8fb",
        },
        components: {
          Layout: {
            siderBg: "#aaa8fb",
            triggerBg: "#aaa8fb",
          },
          Menu: {
            itemBg: "#aaa8fb",
            itemColor: "#fff",
            itemSelectedColor: "#000",
          }
        },
      }}
    >
      <App />
    </ConfigProvider>
  </Router>
);
