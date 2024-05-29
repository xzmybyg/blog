import { create } from 'zustand'

function expire<T extends object>(fn: (set: (args: Partial<T>) => void) => T, expiryMilliseconds: number) {
  return (set: (args: Partial<T>) => void) =>
    fn((args) => {
      set(args)
      localStorage.setItem('my-blog-store', (Date.now() + expiryMilliseconds).toString())
    })
}

// 创建一个store;
const useStore = create<Store>(
  expire(
    (set) => ({
      aticleTotal: 0,
      setTotal: (value: number) => set({ aticleTotal: value }),
      articleList: [],
      setArticleList: (value: any[]) => set({ articleList: value }),
      Notice: '',
      setNotice: (value: string) => set({ Notice: value }),
    }),
    1000 * 60 * 60 * 24 * 7,
  ),
)

export default useStore
