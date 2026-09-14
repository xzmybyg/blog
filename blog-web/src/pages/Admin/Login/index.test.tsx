import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { message } from 'antd'
import { login } from '@/apis/lib/user'
import { setUserInfo } from '@/store/user'
import Login from './index'

vi.mock('@/apis/lib/user', () => ({
  login: vi.fn(),
  register: vi.fn(),
}))

vi.mock('@/store/user', () => ({
  setUserInfo: vi.fn(),
}))

const loginMock = vi.mocked(login)
const setUserInfoMock = vi.mocked(setUserInfo)

const submitLogin = () => {
  fireEvent.change(screen.getByPlaceholderText('账号'), { target: { value: 'admin-user' } })
  fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'secure-password' } })
  fireEvent.click(screen.getByRole('button', { name: /登\s*录/ }))
}

describe('admin login page', () => {
  beforeEach(() => {
    loginMock.mockReset()
    setUserInfoMock.mockReset()
    vi.spyOn(message, 'success').mockImplementation(() => undefined as never)
    vi.spyOn(message, 'error').mockImplementation(() => undefined as never)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('explains when the previous session has expired', () => {
    render(
      <MemoryRouter initialEntries={['/admin/login?reason=expired']}>
        <Login />
      </MemoryRouter>,
    )

    expect(screen.getByText('登录状态已失效')).toBeInTheDocument()
    expect(screen.getByText('请重新登录，完成后将返回之前的管理页面。')).toBeInTheDocument()
  })

  it('stores an administrator and returns to the requested admin page', async () => {
    const user = { id: 1, username: 'admin-user', role: 'admin', token: 'token' }
    loginMock.mockResolvedValue({ data: user } as never)

    render(
      <MemoryRouter initialEntries={['/admin/login?redirect=/admin/article']}>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/article" element={<div>文章管理页面</div>} />
        </Routes>
      </MemoryRouter>,
    )

    submitLogin()

    await waitFor(() => expect(screen.getByText('文章管理页面')).toBeInTheDocument())
    expect(loginMock).toHaveBeenCalledWith({ username: 'admin-user', password: 'secure-password' })
    expect(setUserInfoMock).toHaveBeenCalledWith(user)
  })

  it('rejects an account without admin-console access', async () => {
    loginMock.mockResolvedValue({
      data: { id: 2, username: 'normal-user', role: 'user', token: 'token' },
    } as never)

    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <Login />
      </MemoryRouter>,
    )

    submitLogin()

    await waitFor(() => expect(message.error).toHaveBeenCalledWith('当前账号没有后台访问权限'))
    expect(setUserInfoMock).not.toHaveBeenCalled()
    expect(screen.getByText('登录后台')).toBeInTheDocument()
  })
})
