import type { User } from "../index.d";

export type Store = {
  aticleTotal: number;
  setTotal: (value: number) => void;
  articleList: any[];
  setArticleList: (value: any[]) => void;
  Notice: string;
  setNotice: (value: string) => void;
  user: User;
  setUser: (value: User) => void;
  token: string;
  setToken: (value: string) => void;
};
