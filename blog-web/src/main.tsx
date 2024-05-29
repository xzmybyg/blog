// import React from "react";
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import { BrowserRouter as Router } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import Theme from '@/styleConfig/antdConfig.js'

import '@/assets/iconfont/font_4530597_shxu8uijqn/iconfont.css'
import '@/assets/iconfont/font_4530597_shxu8uijqn/iconfont.js'

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>
  <Router>
    <ConfigProvider theme={Theme}>
      <App />
    </ConfigProvider>
  </Router>,
  //</React.StrictMode>
)
