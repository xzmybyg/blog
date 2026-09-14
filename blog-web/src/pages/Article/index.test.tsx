import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAllArticleList, getArticleTopicList, getLabelList } from '@/apis'
import Article from './index'

vi.mock('@/apis', () => ({
  getAllArticleList: vi.fn(),
  getArticleTopicList: vi.fn(),
  getLabelList: vi.fn(),
}))

vi.mock('@/components/BlogAside/index', () => {
  const BlogAside = () => <aside>博主信息</aside>
  BlogAside.PublicNotice = () => <aside>公告</aside>
  BlogAside.LabelCard = () => <aside>标签</aside>
  return { default: BlogAside }
})

const getAllArticleListMock = vi.mocked(getAllArticleList)
const getArticleTopicListMock = vi.mocked(getArticleTopicList)
const getLabelListMock = vi.mocked(getLabelList)

const articles = [
  {
    id: 7,
    title: 'React 测试实践',
    description: '组件行为验证',
    createTime: '2026-09-14',
    topicId: 2,
    topicName: 'React 原理',
    labelIds: [3],
  },
  {
    id: 8,
    title: 'TypeScript 类型体操',
    description: '类型系统笔记',
    createTime: '2026-09-13',
    topicId: 4,
    topicName: 'TypeScript',
    labelIds: [5],
  },
]

function renderArticle() {
  return render(
    <MemoryRouter>
      <Article />
    </MemoryRouter>,
  )
}

describe('article archive page', () => {
  beforeEach(() => {
    getAllArticleListMock.mockReset().mockResolvedValue({ data: articles } as never)
    getArticleTopicListMock.mockReset().mockResolvedValue({ data: [] } as never)
    getLabelListMock.mockReset().mockResolvedValue({ data: [] } as never)
  })

  it('loads articles with their metadata and detail links', async () => {
    renderArticle()

    expect(await screen.findByRole('link', { name: 'React 测试实践' })).toHaveAttribute('href', '/topic/7')
    expect(screen.getByText('组件行为验证')).toBeInTheDocument()
    expect(screen.getByText('专题 · React 原理')).toBeInTheDocument()
    expect(screen.getByText('共 2 篇文章')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '阅读文章：TypeScript 类型体操' })).toHaveAttribute('href', '/topic/8')
  })

  it('filters articles by title and clears the condition', async () => {
    renderArticle()
    await screen.findByRole('link', { name: 'React 测试实践' })

    fireEvent.change(screen.getByPlaceholderText('输入文章标题'), { target: { value: 'typescript' } })

    expect(screen.queryByRole('link', { name: 'React 测试实践' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'TypeScript 类型体操' })).toBeInTheDocument()
    expect(screen.getByText('找到 1 篇文章')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '清空条件' }))

    expect(screen.getByRole('link', { name: 'React 测试实践' })).toBeInTheDocument()
    expect(screen.getByText('共 2 篇文章')).toBeInTheDocument()
  })

  it('shows a retry message when loading articles fails', async () => {
    getAllArticleListMock.mockRejectedValue(new Error('network error'))
    renderArticle()

    await waitFor(() => expect(screen.getByText('文章加载失败，请稍后刷新重试')).toBeInTheDocument())
  })
})
