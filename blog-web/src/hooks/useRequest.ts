export default function useRequest<T>(fun: (params: T) => Promise<any>, params: T) {
  const [data, setData] = useState<any>(null)
  // const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    // setLoading(true);
    fun(params)
      .then((res) => {
        setData(res.data)
      })
      .catch((err) => {
        setError(err)
      })
      .finally(() => {
        // setLoading(false);
      })
  }, [JSON.stringify(params)])

  return { data, error }
}
