export function getMessage() {
  return axiosInstance.get("/message")
}

export function postMessage(id: number, content: string) {
  return axiosInstance.post("/message", {
    id,
    content,
  })
}
