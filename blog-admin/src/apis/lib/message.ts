export function getMessageList() {
  return axiosInstance.get("/message");
}

export function addMessage(data) {
  return axiosInstance.post("/message", data);
}

export function deleteMessage(id) {
  return axiosInstance.delete("/message", {
    params: {
      id,
    },
  });
}

export function updateMessage(data) {
  return axiosInstance.put("/message", data);
}
