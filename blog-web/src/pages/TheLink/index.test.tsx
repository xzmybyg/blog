import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applyLink, getLinkList } from '@/apis'
import TheLink from './index'

vi.mock('@/apis', () => ({
  applyLink: vi.fn(),
  getLinkList: vi.fn(),
}))

vi.mock('@/components/BlogAside/index', () => {
  const BlogAside = () => <aside>博主信息</aside>
  BlogAside.PublicNotice = () => <aside>公告</aside>
  BlogAside.Website = () => <aside>网站资讯</aside>
  return { default: BlogAside }
})

const applyLinkMock = vi.mocked(applyLink)
const getLinkListMock = vi.mocked(getLinkList)

function renderTheLink() {
  return render(<TheLink />)
}

async function fillApplicationForm(url = 'https://example.com', logo = 'https://example.com/avatar.png') {
  fireEvent.change(screen.getByLabelText('网站名称'), { target: { value: '测试站点' } })
  fireEvent.change(screen.getByLabelText('一句话描述'), { target: { value: '自动化测试笔记' } })
  fireEvent.change(screen.getByLabelText('网站地址'), { target: { value: url } })
  fireEvent.change(screen.getByLabelText('头像地址'), { target: { value: logo } })
  fireEvent.click(screen.getByRole('button', { name: '提交申请' }))
}

describe('friend link page', () => {
  beforeEach(() => {
    applyLinkMock.mockReset().mockResolvedValue({ data: {} } as never)
    getLinkListMock.mockReset().mockResolvedValue({ data: [] } as never)
  })

  it('renders friend links with a safe external-link contract', async () => {
    getLinkListMock.mockResolvedValue({
      data: [{
        id: 1,
        title: '示例博客',
        describe: '持续记录技术实践',
        url: 'https://example.com/posts',
        logo: 'https://example.com/logo.png',
      }],
    } as never)

    renderTheLink()

    const link = await screen.findByRole('link', { name: '访问 示例博客（新标签页）' })
    expect(link).toHaveAttribute('href', 'https://example.com/posts')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
    expect(screen.getByText('example.com')).toBeInTheDocument()
    expect(screen.getByText('持续记录技术实践')).toBeInTheDocument()
  })

  it('shows the empty-directory state when no links are approved', async () => {
    renderTheLink()

    expect(await screen.findByText('目录暂时为空')).toBeInTheDocument()
    expect(screen.getByText('欢迎成为这里的第一位邻居。')).toBeInTheDocument()
  })

  it('submits a complete link application', async () => {
    renderTheLink()
    await screen.findByText('目录暂时为空')

    await fillApplicationForm()

    await waitFor(() => expect(applyLinkMock).toHaveBeenCalledWith({
      title: '测试站点',
      describe: '自动化测试笔记',
      url: 'https://example.com',
      logo: 'https://example.com/avatar.png',
    }))
  })

  it('rejects malformed site and avatar URLs before submission', async () => {
    renderTheLink()
    await screen.findByText('目录暂时为空')

    await fillApplicationForm('not-a-url', 'invalid-logo')

    expect(await screen.findByText('请输入完整的 https:// 地址')).toBeInTheDocument()
    expect(screen.getByText('请输入完整的图片地址')).toBeInTheDocument()
    expect(applyLinkMock).not.toHaveBeenCalled()
  })
})
