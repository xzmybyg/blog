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
