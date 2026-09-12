import { AxiosResponse } from 'axios'
import useUserStore, { logoutInfo } from '@/store/user'
import { ADMIN_LOGIN_PATH, getAdminLoginUrl } from './auth'

const devBaseUrl = '/api'
const proBaseUrl = '/api'
const BASE_URL = import.meta.env.MODE === 'development' ? devBaseUrl : proBaseUrl

const axiosInstance = axios.create({
  baseURL: BASE_URL, // api的base_url
  timeout: 5000, // 请求超时时间
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token
    if (token) {
      config.headers['Authorization'] = token
    }
    // 删除重复的请求
    // removePending(config);
    // 如果repeatRequest不配置，那么该请求则不能多次请求
    // !config.repeatRequest && addPending(config)
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

type ResponseData = AxiosResponse & {
  message?: string
  msg?: string
}

axiosInstance.interceptors.response.use(
  (response: ResponseData) => {
    if (response.status === 200) {
      return response
    } else {
      console.error(response.message || response.msg)
    }
    // 删除重复的请求
    // removePending(response.config);
    return response
  },
  (error) => {
    // 删除重复的请求
    // error.config && removePending(error.config);

    const status = error.response?.status
    let text = ''
    if (status) {
      switch (status) {
        case 400:
          text = '请求错误(400)，请重新申请'
          break
        case 401:
          text = '登录错误(401)，请重新登录'
          if (useUserStore.getState().token) {
            logoutInfo()
            const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
            const isAdminPage = window.location.pathname.startsWith('/admin')
            const isLoginPage = window.location.pathname === ADMIN_LOGIN_PATH
            if (isAdminPage && !isLoginPage) {
              window.location.replace(getAdminLoginUrl(currentPath))
            }
          }
          break
        case 403:
          text = '拒绝访问(403)'
          break
        case 404:
          text = '请求出错(404)'
          break
        case 408:
          text = '请求超时(408)'
          break
        case 429:
          text = error.response?.data?.message || '请求过于频繁，请稍后重试'
          break
        case 500:
          text = '服务器错误(500)，请重启软件或切换功能页！'
          break
        case 501:
          text = '服务未实现(501)'
          break
        case 502:
          text = '网络错误(502)'
          break
        case 503:
          text = '服务不可用(503)'
          break
        case 504:
          text = '网络超时(504)'
          break
        case 505:
          text = 'HTTP版本不受支持(505)'
          break
        default:
          text = '网络连接出错'
      }
    } else {
      text = '连接服务器失败,请退出重试!'
    }
    console.error(text)

    return Promise.reject(error)
  },
)

export default axiosInstance
