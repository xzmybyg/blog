import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAboutContent } from '@/apis/lib/about'
import About from './index'

vi.mock('@/apis/lib/about', () => ({
  getAboutContent: vi.fn(),
}))

const getAboutContentMock = vi.mocked(getAboutContent)

describe('about page', () => {
  beforeEach(() => {
    getAboutContentMock.mockReset()
  })

  it('renders markdown returned by the content API', async () => {
    getAboutContentMock.mockResolvedValue({ data: '# 关于我\n\n专注 **React** 开发。' } as never)

    render(<About />)

    expect(await screen.findByRole('heading', { name: '关于我' })).toBeInTheDocument()
    expect(screen.getByText('React')).toHaveTextContent('React')
    expect(screen.getByLabelText('关于页正文')).toBeInTheDocument()
  })

  it('shows an error state when loading fails', async () => {
    getAboutContentMock.mockRejectedValue(new Error('network error'))

    render(<About />)

    expect(await screen.findByText('关于页内容加载失败')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新加载' })).toBeInTheDocument()
  })

  it('retries loading content after a failure', async () => {
    getAboutContentMock
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ data: '重新加载成功' } as never)

    render(<About />)
    fireEvent.click(await screen.findByRole('button', { name: '重新加载' }))

    expect(await screen.findByText('重新加载成功')).toBeInTheDocument()
    await waitFor(() => expect(getAboutContentMock).toHaveBeenCalledTimes(2))
  })
})
