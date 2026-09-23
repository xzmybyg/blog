export function login({ username, password }: loginParams) {
  return axiosInstance.post('/users/login', { username, password })
}

export function register({ username, password, email }: registerParams) {
  return axiosInstance.post('/users', {
    params: {
      username,
      password,
      email,
    },
  })
}

export function requestPasswordReset(email: string) {
  return axiosInstance.post('/users/password-reset/request', { email })
}

export function confirmPasswordReset(data: { email: string; code: string; password: string }) {
  return axiosInstance.post('/users/password-reset/confirm', data)
}

export function getCurrentUser() {
  return axiosInstance.get<User>('/users/me')
}

export function updateCurrentUser(data: Pick<User, 'nickname' | 'avatar'>) {
  return axiosInstance.put('/users', data)
}

export function uploadUserAvatar(file: File) {
  return axiosInstance.put<{ avatar: string }>('/users/avatar', file, {
    headers: { 'Content-Type': file.type },
    timeout: 30000,
  })
}

/*-----管理系统接口-----*/

//获取用户列表
export function getUserList() {
  return axiosInstance.get('/users/usersList')
}

//删除用户
export function deleteUser(id: number) {
  return axiosInstance.delete('/users', {
    params: {
      id,
    },
  })
}

//编辑用户
export function updateUser(data) {
  return axiosInstance.put('/users', data)
}
