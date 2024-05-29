export function getMessage() {
  return axiosInstance.get("/message")
}

export function postMessage(id: number, content: string) {
  return axiosInstance.post("/message", {
    id,
    content,
  })
}

/*-----管理系统接口-----*/

//获取留言列表
export function getMessageList() {
  return axiosInstance.get("/message");
}

//删除留言
export function deleteMessage(id) {
  return axiosInstance.delete("/message", {
    params: {
      id,
    },
  });
}

//编辑留言
export function updateMessage(data) {
  return axiosInstance.put("/message", data);
}