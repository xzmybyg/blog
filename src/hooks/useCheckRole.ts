import useStore from "@/store";
export function useCheckRole() {
  const { user } = useStore();
  return {
    isAdmin: user.role === "管理员",
  };
}
