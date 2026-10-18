// import React from "react";
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import { BrowserRouter as Router } from 'react-router-dom'
import ThemeProvider from '@/styleConfig/ThemeProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { installGlobalErrorMonitoring } from '@/utils/errorReporter'

import '@/assets/iconfont/font_4530597_shxu8uijqn/iconfont.css'

installGlobalErrorMonitoring()

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>
  <ErrorBoundary>
    <Router>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Router>
  </ErrorBoundary>,
  //</React.StrictMode>
)
