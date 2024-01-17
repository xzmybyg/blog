export type User = {
  id: number | null;
  username: string;
  avatar?: string;
  role: string;

  nickname?: string;
  role: string;
  email?: string;
  token: string;
};
export type loginParams = {
  username: string;
  password: string;
};
export type registerParams = loginParams & {
  email: string;
};
export type UserStore = User & {
  setId: (value: number | null) => void;
  setUserName: (value: string) => void;
  setAvatar: (value: string) => void;
  setRole: (value: string) => void;
  setNickname: (value: string) => void;
  setEmail: (value: string) => void;
  setToken: (value: string) => void;
};
