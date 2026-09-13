import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/index', () => ({
  axiosInstance: { post: vi.fn() },
}))

import { login, register } from './user'
import { axiosInstance } from '@/utils/index'

const post = vi.mocked(axiosInstance.post)

describe('user api', () => {
  beforeEach(() => {
    post.mockReset()
  })

  it('sends login credentials in a POST request body', () => {
    login({ username: 'test-user', password: 'secret-password' })

    expect(post).toHaveBeenCalledWith('/users/login', {
      username: 'test-user',
      password: 'secret-password',
    })
  })

  it('submits registration fields without using URL query parameters', () => {
    register({ username: 'test-user', password: 'secret-password', email: 'test@example.com' })

    expect(post).toHaveBeenCalledWith('/users', {
      params: {
        username: 'test-user',
        password: 'secret-password',
        email: 'test@example.com',
      },
    })
  })
})
