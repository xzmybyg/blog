
export function getLabelList() {
  return axiosInstance.get("/label");
}

export function addLabel(data) {
  return axiosInstance.post("/label", data);
}

export function deleteLabel(id) {
  return axiosInstance.delete("/label", {
    params: {
      id,
    },
  });
}

export function updateLabel(data) {
  return axiosInstance.put("/label", data);
}
