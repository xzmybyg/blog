import useStore from "@/store";
export function useCheckRole() {
  const { token } = useStore();
    return {
        isLogin: token !== "",
    };
}
