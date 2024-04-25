
export function getLinkList() {
  return axiosInstance.get("/link");
}

export type FormValues = {
  title: string;
  describe: string;
  url: string;
  logo: string;
  applyTime?: Date;
};

export function applyLink(params: FormValues) {
  return axiosInstance.post("/link", {
    params,
  });
}
