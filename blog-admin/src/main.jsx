import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { ConfigProvider } from "antd";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <ConfigProvider theme={{}}>
      <App />
    </ConfigProvider>
  </Router>
);
