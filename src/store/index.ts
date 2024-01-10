import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Store, User } from "@/types";

function expire<T extends object>(
  fn: (set: (args: Partial<T>) => void) => T,
  expiryMilliseconds: number
) {
  return (set: (args: Partial<T>) => void) =>
    fn(args => {
      set(args);
      localStorage.setItem(
        "my-blog-store",
        (Date.now() + expiryMilliseconds).toString()
      );
    });
}

// 创建一个store
const useStore = create<Store>(
  // persist(
  expire(
    set => ({
      aticleTotal: 0,
      setTotal: (value: number) => set({ aticleTotal: value }),
      articleList: [],
      setArticleList: (value: any[]) => set({ articleList: value }),
      Notice: "",
      setNotice: (value: string) => set({ Notice: value }),
      user: { id: null, username: "", avatar: "", role: "用户" },
      setUser: (value: User) => set({ user: value }),
      token: "",
      setToken: (value: string) => set({ token: value }),
    }),
    1000 * 60 * 60 * 24 * 7
  )
  // { name: "my-blog-store", getStorage: () => localStorage }
  // )
);

export default useStore;
