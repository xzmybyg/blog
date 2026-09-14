import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { message } from 'antd'
import { getRateLimitConfig, updateRateLimitConfig } from '@/apis'
import useUserStore from '@/store/user'
import RateLimitAdmin from './index'

vi.mock('@/apis', () => ({
  getRateLimitConfig: vi.fn(),
  resetRateLimitConfig: vi.fn(),
  updateRateLimitConfig: vi.fn(),
}))

const getRateLimitConfigMock = vi.mocked(getRateLimitConfig)
const updateRateLimitConfigMock = vi.mocked(updateRateLimitConfig)

const globalRule = {
  key: 'global',
  label: '全部 API',
  description: '所有 /api 请求的基础保护',
  max: 120,
  windowMs: 60_000,
  source: 'default' as const,
  version: 1,
}

describe('RateLimitAdmin', () => {
  beforeEach(() => {
    getRateLimitConfigMock.mockReset().mockResolvedValue({ data: [globalRule] } as never)
    updateRateLimitConfigMock.mockReset().mockResolvedValue({
      data: { ...globalRule, max: 200, source: 'database', version: 2 },
    } as never)
    useUserStore.setState({ role: 'admin' })
    vi.spyOn(message, 'success').mockImplementation(() => undefined as never)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('converts milliseconds to a readable unit and saves edits', async () => {
    render(<RateLimitAdmin />)

    expect(await screen.findByText('当前：120 次 / 1 分钟')).toBeInTheDocument()
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '200' } })
    fireEvent.click(screen.getByRole('button', { name: /保存并生效/ }))

    await waitFor(() => {
      expect(updateRateLimitConfigMock).toHaveBeenCalledWith('global', { max: 200, windowMs: 60_000 })
    })
  })

  it('makes rule controls read-only for viewer accounts', async () => {
    useUserStore.setState({ role: 'viewer' })
    render(<RateLimitAdmin />)

    await screen.findByText('全部 API')
    for (const input of screen.getAllByRole('spinbutton')) expect(input).toBeDisabled()
    expect(screen.getByRole('combobox', { name: '时间单位' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: /保存并生效/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /恢复默认/ })).not.toBeInTheDocument()
  })
})
