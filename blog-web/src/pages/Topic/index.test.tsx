import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { message } from 'antd'
import { getArticleLikes, getArticleNavigation, getTopic, likeArticle } from '@/apis'
import { getComment } from '@/apis/lib/comment'
import { getVisitorId } from '@/utils/visitorId'
import { isRequestThrottled } from '@/utils/requestThrottle'
import Topic from './index'

vi.mock('@/apis', () => ({
  getArticleLikes: vi.fn(),
  getArticleNavigation: vi.fn(),
  getTopic: vi.fn(),
  likeArticle: vi.fn(),
}))

vi.mock('@/apis/lib/comment', () => ({
  addComments: vi.fn(),
  getComment: vi.fn(),
}))

vi.mock('@/utils/visitorId', () => ({
  getVisitorId: vi.fn(),
}))

vi.mock('@/utils/requestThrottle', () => ({
  isRequestThrottled: vi.fn(),
}))

vi.mock('@/store/user', () => ({
  default: () => ({ id: null }),
}))

vi.mock('@/components/CommentList/index', () => ({
  default: () => <div>评论内容</div>,
}))

vi.mock('markdown-navbar', () => ({
  default: () => <div aria-label="文章目录" />,
}))

const getTopicMock = vi.mocked(getTopic)
const getNavigationMock = vi.mocked(getArticleNavigation)
const getLikesMock = vi.mocked(getArticleLikes)
const likeArticleMock = vi.mocked(likeArticle)
const getCommentMock = vi.mocked(getComment)
const getVisitorIdMock = vi.mocked(getVisitorId)
const isRequestThrottledMock = vi.mocked(isRequestThrottled)

function renderTopic() {
  return render(
    <MemoryRouter initialEntries={['/topic/7']}>
      <Routes>
        <Route path="/topic/:id" element={<Topic />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('article detail page', () => {
  beforeEach(() => {
    localStorage.clear()
    getTopicMock.mockReset().mockResolvedValue({ data: '# React 测试' } as never)
    getNavigationMock.mockReset().mockResolvedValue({
      data: {
        topic: { id: 2, name: 'React 原理' },
        position: 2,
        total: 3,
        previous: { id: 6, title: '上一章' },
        next: { id: 8, title: '下一章' },
      },
    } as never)
    getLikesMock.mockReset().mockResolvedValue({ data: { likes: 12 } } as never)
    likeArticleMock.mockReset()
    getCommentMock.mockReset().mockResolvedValue({ data: [] } as never)
    getVisitorIdMock.mockReset().mockReturnValue('visitor-1')
    isRequestThrottledMock.mockReset().mockReturnValue(false)
    vi.spyOn(message, 'success').mockImplementation(() => undefined as never)
    vi.spyOn(message, 'error').mockImplementation(() => undefined as never)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads article content, likes and chapter navigation', async () => {
    renderTopic()

    expect(await screen.findByRole('heading', { name: 'React 测试' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /喜欢这篇/ })).toHaveTextContent('12')
    expect(screen.getByText('专题 · React 原理')).toBeInTheDocument()
    expect(screen.getByText('第 2 / 3 章')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /上一章/ })).toHaveAttribute('href', '/topic/6')
    expect(screen.getByRole('link', { name: /下一章/ })).toHaveAttribute('href', '/topic/8')
  })

  it('records a successful anonymous like and updates the count', async () => {
    likeArticleMock.mockResolvedValue({ data: { likes: 13, liked: true } } as never)
    renderTopic()

    fireEvent.click(await screen.findByRole('button', { name: /喜欢这篇/ }))

    await waitFor(() => expect(likeArticleMock).toHaveBeenCalledWith(7, 'visitor-1'))
    expect(screen.getByRole('button', { name: /已喜欢/ })).toHaveTextContent('13')
    expect(screen.getByRole('button', { name: /已喜欢/ })).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem('blog-article-liked-7')).toBe('1')
    expect(message.success).toHaveBeenCalledWith('感谢你的喜欢')
  })

  it('does not send another request for an article already liked locally', async () => {
    localStorage.setItem('blog-article-liked-7', '1')
    renderTopic()

    const button = await screen.findByRole('button', { name: /已喜欢/ })
    fireEvent.click(button)

    expect(likeArticleMock).not.toHaveBeenCalled()
  })
})
