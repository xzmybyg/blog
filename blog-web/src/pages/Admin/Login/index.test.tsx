import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Login from './index'

vi.mock('@/apis', () => ({
  login: vi.fn(),
  register: vi.fn(),
}))

describe('admin login page', () => {
  it('explains when the previous session has expired', () => {
    render(
      <MemoryRouter initialEntries={['/admin/login?reason=expired']}>
        <Login />
      </MemoryRouter>,
    )

    expect(screen.getByText('登录状态已失效')).toBeInTheDocument()
    expect(screen.getByText('请重新登录，完成后将返回之前的管理页面。')).toBeInTheDocument()
  })
})
