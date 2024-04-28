
export function getComment(id: number) {
  return axiosInstance.get("/comment", {
    params: {
      id,
    },
  });
}
