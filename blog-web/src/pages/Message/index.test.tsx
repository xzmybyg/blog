import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { message } from 'antd'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useUserStore from '@/store/user'
import { getMessage, postMessage } from '@/apis/lib/message'
import Message from './index'

vi.mock('@/store/user', () => ({
  default: vi.fn(),
}))

vi.mock('@/apis/lib/message', () => ({
  getMessage: vi.fn(),
  postMessage: vi.fn(),
}))

vi.mock('@/hooks/useSiteBackground', () => ({
  default: () => '/message-background.jpg',
}))

vi.mock('@/components/Barrage', () => ({
  default: ({ comments }: { comments: Array<{ content: string }> }) => (
    <div data-testid="message-list">{comments.map((item) => item.content).join('|')}</div>
  ),
}))

const useUserStoreMock = vi.mocked(useUserStore)
const getMessageMock = vi.mocked(getMessage)
const postMessageMock = vi.mocked(postMessage)

async function renderMessage() {
  render(<Message />)
  await screen.findByText('已有留言')
}

describe('message page', () => {
  beforeEach(() => {
    useUserStoreMock.mockReset().mockReturnValue({ id: null } as never)
    getMessageMock.mockReset().mockResolvedValue({ data: [{ id: 1, content: '已有留言' }] } as never)
    postMessageMock.mockReset()
    vi.spyOn(message, 'error').mockImplementation(() => undefined as never)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('requires login before posting a message', async () => {
    await renderMessage()

    fireEvent.change(screen.getByRole('textbox', { name: '留言内容' }), {
      target: { value: '新的留言' },
    })
    fireEvent.click(screen.getByRole('button', { name: /发\s*送/ }))

    await waitFor(() => expect(message.error).toHaveBeenCalledWith('请先登录'))
    expect(postMessageMock).not.toHaveBeenCalled()
  })

  it('appends a successful message and clears the input', async () => {
    useUserStoreMock.mockReturnValue({ id: 9 } as never)
    postMessageMock.mockResolvedValue({ data: { id: 2, content: '新的留言' } } as never)
    await renderMessage()

    const input = screen.getByRole('textbox', { name: '留言内容' })
    fireEvent.change(input, { target: { value: '新的留言' } })
    fireEvent.click(screen.getByRole('button', { name: /发\s*送/ }))

    await waitFor(() => expect(postMessageMock).toHaveBeenCalledWith(9, '新的留言'))
    expect(screen.getByTestId('message-list')).toHaveTextContent('已有留言|新的留言')
    await waitFor(() => expect(screen.getByRole('textbox', { name: '留言内容' })).toHaveValue(''))
  })

  it('shows the server message when posting fails', async () => {
    useUserStoreMock.mockReturnValue({ id: 9 } as never)
    postMessageMock.mockRejectedValue({ response: { data: { message: '发布过于频繁，请稍后再试' } } })
    await renderMessage()

    fireEvent.change(screen.getByRole('textbox', { name: '留言内容' }), {
      target: { value: '新的留言' },
    })
    fireEvent.click(screen.getByRole('button', { name: /发\s*送/ }))

    await waitFor(() => expect(message.error).toHaveBeenCalledWith('发布过于频繁，请稍后再试'))
  })
})
