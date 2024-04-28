import { create } from "zustand"
import { persist, devtools } from "zustand/middleware"

const useUserStore = create<UserStore>()(
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
      }),
      { name: "user-store" }
    ),
    { enabled: true, name: "User store" }
  )
)

export default useUserStore

export const setUserInfo = (values: UserStore) => {
  useUserStore.setState(() => values)
}

export const logoutInfo = () => {
  return useUserStore.setState(() => ({
    id: null,
    username: "",
    avatar: "",
    nickname: "",
    role: "",
    email: "",
    token: "",
  }))
}
