import { create } from "zustand";
import Store from "@/types/lib/Store";

// 创建一个store
const useStore = create<Store>(set => ({
  aticleTotal: 0,
  setTotal: (value: number) => set(() => ({ aticleTotal: value })),
  articleList: [],
  setArticleList: (value: any[]) => set(() => ({ articleList: value })),
  Notice: "",
  setNotice: (value: string) => set(() => ({ Notice: value })),
}));

export default useStore;
