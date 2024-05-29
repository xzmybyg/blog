export function getComment(id: number) {
  return axiosInstance.get("/comment", {
    params: {
      id,
    },
  })
}

export function addComments(params: any) {
  return axiosInstance.post("/comment", {
    params,
  })
}

export function addReply(params: any) {
  return axiosInstance.post("/reply", {
    params,
  })
}

/*-----管理系统接口-----*/

//获取评论列表
export function getCommentList() {
  return axiosInstance.get("/comment/commentList");
}

//删除评论
export function deleteComment(id) {
  return axiosInstance.delete("/comment", {
    params: {
      id,
    },
  });
}

//编辑评论
export function updateComment(data) {
  return axiosInstance.put("/comment", data);
}

//删除回复
export function deleteReply(id: number) {
  return axiosInstance.delete("/reply", {
    params: {
      id,
    },
  });
}