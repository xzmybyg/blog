import { AxiosResponse } from "axios";

const WithAxios = <T,>(
  Component: React.FC<{ data: T | null }>,
  fn: () => Promise<AxiosResponse<any>>
) => {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    fn().then((res: any) => {
      setData(res.data);
    });
  }, []);

  return <Component data={data} />;
};

export default WithAxios;
