declare type User = {
  id: number;
  username: string;
  avatar?: string;
  role: string;

  nickname?: string;
  role: string;
  email?: string;
  token: string;
};
declare type loginParams = {
  username: string;
  password: string;
};
declare type registerParams = loginParams & {
  email: string;
};
declare type UserStore = User & {
  setId: (value: number | null) => void;
  setUserName: (value: string) => void;
  setAvatar: (value: string) => void;
  setRole: (value: string) => void;
  setNickname: (value: string) => void;
  setEmail: (value: string) => void;
  setToken: (value: string) => void;
};
