import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ArticleCard from './index'

function renderCard(banner = 'cover.png') {
  return render(
    <MemoryRouter>
      <ArticleCard
        id={7}
        title="React 测试"
        description="组件行为验证"
        createTime={new Date('2026-09-14T00:00:00Z')}
        topping
        topicName="React 原理"
        label={['测试']}
        banner={banner}
        addClassName=""
      />
    </MemoryRouter>,
  )
}

describe('ArticleCard', () => {
  it('renders article metadata and links to its detail page', () => {
    renderCard()

    expect(screen.getByRole('heading', { name: /React 测试/ })).toBeInTheDocument()
    expect(screen.getByText('组件行为验证')).toBeInTheDocument()
    expect(screen.getByText('置顶')).toBeInTheDocument()
    expect(screen.getByText('专题 · React 原理')).toBeInTheDocument()
    expect(screen.getByText('测试')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '阅读全文' })).toHaveAttribute('href', '/topic/7')
  })

  it('falls back to the local banner when the remote image fails', () => {
    renderCard()
    const image = screen.getByRole('img', { name: 'React 测试' })

    expect(image).toHaveAttribute(
      'src',
      'https://filespace.xzmybyg.cn/images/cover.png?imageMogr2/thumbnail/960x/format/webp/quality/78',
    )

    fireEvent.error(image)

    expect(image).toHaveAttribute('src', '/banner.webp')
  })
})
