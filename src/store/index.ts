import { create } from "zustand";
import type { Store,User } from "@/types";

// 创建一个store
const useStore = create<Store>(set => ({
  aticleTotal: 0,
  setTotal: (value: number) => set(() => ({ aticleTotal: value })),
  articleList: [],
  setArticleList: (value: any[]) => set(() => ({ articleList: value })),
  Notice: "",
  setNotice: (value: string) => set(() => ({ Notice: value })),
  user: { id: null, username: "", avatar: "" },
  setUser: (value: User) => set(() => ({ user: value })),
  token: "",
  setToken: (value: string) => set(() => ({ token: value })),
}));

export default useStore;
