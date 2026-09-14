import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { message } from 'antd'
import { getErrorEvents, resolveErrorEvent } from '@/apis'
import useUserStore from '@/store/user'
import ErrorMonitorAdmin from './index'

vi.mock('@/apis', () => ({
  deleteErrorEvent: vi.fn(),
  getErrorEvents: vi.fn(),
  resolveErrorEvent: vi.fn(),
}))

const getErrorEventsMock = vi.mocked(getErrorEvents)
const resolveErrorEventMock = vi.mocked(resolveErrorEvent)

const response = {
  data: {
    items: [{
      id: 7,
      fingerprint: 'frontend-runtime-error',
      source: 'client' as const,
      level: 'error' as const,
      message: '页面加载失败',
      stack: 'Error: 页面加载失败',
      route: '/article/1',
      method: 'GET',
      status_code: 500,
      request_id: 'req-7',
      user_agent: null,
      context_json: null,
      occurrences: 3,
      first_seen_at: '2026-09-14T01:00:00.000Z',
      last_seen_at: '2026-09-14T02:00:00.000Z',
      resolved: 0,
      resolved_at: null,
    }],
    summary: { total: 1, openCount: 1, occurrences: 3 },
  },
}

describe('ErrorMonitorAdmin', () => {
  beforeEach(() => {
    getErrorEventsMock.mockReset().mockResolvedValue(response as never)
    resolveErrorEventMock.mockReset().mockResolvedValue({ data: {} } as never)
    useUserStore.setState({ role: 'admin' })
    vi.spyOn(message, 'success').mockImplementation(() => undefined as never)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders error details and summary returned by the API', async () => {
    render(<ErrorMonitorAdmin />)

    expect(await screen.findByText('页面加载失败')).toBeInTheDocument()
    expect(screen.getByText('前端 · 运行错误')).toBeInTheDocument()
    expect(screen.getByText('GET /article/1')).toBeInTheDocument()
    expect(screen.getAllByText('3')).toHaveLength(2)
    expect(getErrorEventsMock).toHaveBeenCalledWith('open')
  })

  it('allows administrators to resolve errors', async () => {
    render(<ErrorMonitorAdmin />)
    fireEvent.click(await screen.findByRole('button', { name: /标记已处理/ }))

    await waitFor(() => expect(resolveErrorEventMock).toHaveBeenCalledWith(7, true))
    await waitFor(() => expect(getErrorEventsMock).toHaveBeenCalledTimes(2))
  })

  it('hides mutation actions from viewers', async () => {
    useUserStore.setState({ role: 'viewer' })
    render(<ErrorMonitorAdmin />)
    await screen.findByText('页面加载失败')
    expect(screen.queryByRole('button', { name: /标记已处理/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /删除/ })).not.toBeInTheDocument()
  })
})
