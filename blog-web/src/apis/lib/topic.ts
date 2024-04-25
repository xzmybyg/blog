/**
 * 获取主题信息
 * @param id 主题ID
 * @returns Promise 包含主题信息的响应
 */
export function getTopic(id: number) {
  return axiosInstance.get("/topic", {
    params: {
      id,
    },
  });
}
