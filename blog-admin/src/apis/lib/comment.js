
export function getComment(id) {
  return axiosInstance.get("/comment", {
    params: {
      id,
    },
  });
}
