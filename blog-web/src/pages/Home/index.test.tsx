import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { getHomeContent } from '@/apis'
import Home from './index'

vi.mock('@/apis', () => ({
  DEFAULT_HOME_CONTENT: {
    eyebrow: '默认眉题', title: '默认标题', authorName: '默认作者', description: '默认简介', typedTexts: ['默认轮播'],
    sectionOrder: ['eyebrow', 'title', 'authorName', 'typedTexts', 'description'],
  },
  DEFAULT_HOME_CONTENT_ORDER: ['eyebrow', 'title', 'authorName', 'typedTexts', 'description'],
  getHomeContent: vi.fn(),
  getPageArticleList: vi.fn(),
}))
vi.mock('@/hooks/useRequest', () => ({ default: () => ({ data: { list: [], total: 0 } }) }))
vi.mock('@/hooks/useSiteBackground', () => ({ default: () => '/banner.webp' }))
vi.mock('@/hooks', () => ({ useTyped: () => ({ current: null }) }))
vi.mock('@/components/ArticleCard', () => ({ default: () => null }))
vi.mock('@/components/BlogAside', () => {
  const BlogAside = () => null
  BlogAside.PublicNotice = () => null
  BlogAside.Website = () => null
  return { default: BlogAside }
})

describe('homepage copy order', () => {
  it('renders sections in the saved editor order', async () => {
    vi.mocked(getHomeContent).mockResolvedValue({
      data: {
        eyebrow: '眉题', title: '主标题', authorName: '作者名', description: '简介先显示', typedTexts: ['轮播内容'],
        sectionOrder: ['description', 'title', 'eyebrow', 'typedTexts', 'authorName'],
      },
    } as never)

    render(<MemoryRouter><Home /></MemoryRouter>)
    await screen.findByText('简介先显示')

    const hero = document.querySelector('section[aria-labelledby="home-title"]')
    const sections = Array.from(hero?.firstElementChild?.children || []).slice(0, 4).map((node) => node.textContent)
    expect(sections).toEqual(['简介先显示', '主标题', '眉题', '。我是作者名，'])
  })
})
