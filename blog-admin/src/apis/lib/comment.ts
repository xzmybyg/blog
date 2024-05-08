export function getComment(id: number) {
  return axiosInstance.get("/comment", {
    params: {
      id,
    },
  });
}

export function getCommentList() {
  return axiosInstance.get("/comment/commentList");
}

export function addComment(data) {
  return axiosInstance.post("/comment", data);
}

export function deleteComment(id) {
  return axiosInstance.delete("/comment", {
    params: {
      id,
    },
  });
}

export function updateComment(data) {
  return axiosInstance.put("/comment", data);
}

export function deleteReply(id: number) {
  return axiosInstance.delete("/reply", {
    params: {
      id,
    },
  });
}
