export function getLinkList() {
  return axiosInstance.get('/link')
}

export type FormValues = {
  title: string
  describe: string
  url: string
  logo: string
  applyTime?: Date
}

export function applyLink(params: FormValues) {
  return axiosInstance.post('/link', {
    params,
  })
}

/*-----管理系统接口-----*/

//获取友链列表
export function getAllLinkList() {
  return axiosInstance.get('/link/all')
}

//删除友链
export function deleteLink(id: number) {
  return axiosInstance.delete('/link', {
    params: {
      id,
    },
  })
}

//编辑友链
export function updateLink(data) {
  return axiosInstance.put('/link', data)
}
