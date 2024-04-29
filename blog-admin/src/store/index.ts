import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

// 创建一个store
const useStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        id: null,
        username: "",
        avatar: "",
        nickname: "",
        role: "",
        email: "",
        token: "",

        setId: (value: number | null) => set({ id: value }),
        setUserName: (value: string) => set({ username: value }),
        setAvatar: (value: string) => set({ avatar: value }),
        setNickname: (value: string) => set({ nickname: value }),
        setRole: (value: string) => set({ role: value }),
        setEmail: (value: string) => set({ email: value }),
        setToken: (value: string) => set({ token: value }),
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
      }),
      { name: "user-store" }
    )
  )
);

export default useStore;
