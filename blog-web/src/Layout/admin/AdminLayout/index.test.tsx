import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useUserStore from '@/store/user'
import AdminLayout from './index'

vi.mock('@/Layout/admin/Header', () => ({
  default: () => <div>后台页头</div>,
}))

describe('AdminLayout', () => {
  beforeEach(() => {
    useUserStore.setState({ role: '' })
  })

  it('shows read-only mode and hides edit-only navigation for viewers', () => {
    useUserStore.setState({ role: 'viewer' })

    render(
      <MemoryRouter initialEntries={['/admin/']}>
        <AdminLayout>后台内容</AdminLayout>
      </MemoryRouter>,
    )

    expect(screen.getByText('只读浏览模式')).toBeInTheDocument()
    expect(screen.getByText('当前账号可以查看后台数据，但不能新增、编辑、删除或执行运维操作。')).toBeInTheDocument()
    expect(screen.queryByText('添加文章')).not.toBeInTheDocument()
  })

  it('keeps edit-only navigation available to administrators', () => {
    useUserStore.setState({ role: 'admin' })

    render(
      <MemoryRouter initialEntries={['/admin/']}>
        <AdminLayout>后台内容</AdminLayout>
      </MemoryRouter>,
    )

    expect(screen.queryByText('只读浏览模式')).not.toBeInTheDocument()
    expect(screen.getByText('添加文章')).toBeInTheDocument()
  })
})
