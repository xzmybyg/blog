export type User = {
  id: number | null;
  username: string;
  avatar: string;
};
export type loginParams = {
  username: string;
  password: string;
};
export type registerParams = loginParams & {
  email: string;
};
