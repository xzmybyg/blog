//获取标签列表
export function getLabelList() {
  return axiosInstance.get('/label')
}

/*-----管理系统接口-----*/
//添加标签
export function addLabel(data) {
  return axiosInstance.post('/label', data)
}

//删除标签
export function deleteLabel(id) {
  return axiosInstance.delete('/label', {
    params: {
      id,
    },
  })
}

//编辑标签
export function updateLabel(data) {
  return axiosInstance.put('/label', data)
}
