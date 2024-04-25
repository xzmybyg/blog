import { create } from "zustand";

// 创建一个store
const useStore = create(set => ({
  // aticleTotal: 0,
  // setTotal: (value: number) => set(() => ({ aticleTotal: value })),
  // articleList: [],
  // setArticleList: (value: any[]) => set(() => ({ articleList: value })),
  // Notice: "",
  // setNotice: (value: string) => set(() => ({ Notice: value })),
  // user: { id: null, username: "", avatar: "" },
  // setUser: (value: User) => set(() => ({ user: value })),
  // token: "",
  // setToken: (value) => set(() => ({ token: value })),
}));

export default useStore;
