import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportClientError } from '@/utils/errorReporter'
import './index.scss'

type Props = { children: ReactNode }
type State = { failed: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportClientError({
      message: error.message,
      stack: error.stack,
      context: { componentStack: info.componentStack || '' },
    })
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="error-fallback">
          <span>PAGE INTERRUPTED / 页面中断</span>
          <h1>页面暂时无法显示</h1>
          <p>错误信息已经记录。刷新页面通常可以恢复当前操作。</p>
          <button type="button" onClick={() => window.location.reload()}>重新加载页面</button>
        </main>
      )
    }
    return this.props.children
  }
}
