export function getTopic(id: string) {
  return axiosInstance.get("/topic", {
    params: {
      id,
    },
  });
}
