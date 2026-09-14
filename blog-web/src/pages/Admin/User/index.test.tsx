import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteUser, getUserList } from '@/apis/lib/user'
import useUserStore from '@/store/user'
import UserAdmin from './index'

vi.mock('@/apis/lib/user', () => ({
  deleteUser: vi.fn(),
  getUserList: vi.fn(),
  updateUser: vi.fn(),
}))

const deleteUserMock = vi.mocked(deleteUser)
const getUserListMock = vi.mocked(getUserList)
const getComputedStyle = window.getComputedStyle

const viewer = {
  id: 5,
  username: 'audit-user',
  nickname: '审阅员',
  avatar: '',
  role: 'viewer',
  email: 'audit@example.com',
  token: '',
  commentLimit: true,
  createTime: '2026-09-14T00:00:00.000Z',
}

describe('UserAdmin', () => {
  beforeEach(() => {
    getUserListMock.mockReset().mockResolvedValue({ data: [viewer] } as never)
    deleteUserMock.mockReset().mockResolvedValue({ data: {} } as never)
    useUserStore.setState({ role: 'admin' })
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => getComputedStyle(element))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the localized viewer role and lets administrators delete a user', async () => {
    render(<UserAdmin />)

    expect(await screen.findByText('只读访客')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /删\s*除/ }))

    await waitFor(() => expect(deleteUserMock).toHaveBeenCalledWith(5))
    await waitFor(() => expect(screen.queryByText('audit-user')).not.toBeInTheDocument())
  })

  it('disables mutations when the current account is a viewer', async () => {
    useUserStore.setState({ role: 'viewer' })
    render(<UserAdmin />)

    expect(await screen.findByText('只读')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeDisabled()
    expect(screen.queryByRole('button', { name: /编\s*辑/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /删\s*除/ })).not.toBeInTheDocument()
  })
})
