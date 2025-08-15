import axios from 'axios'
import { getToken, signOut, setToken } from './auth'

const baseURL =
  ((process.env.NEXT_PUBLIC_API_BASE_URL || '').trim().replace(/\/$/, '')) ||
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:4000/api')

const api = axios.create({ baseURL, timeout: 15000, withCredentials: false })

api.interceptors.request.use((cfg) => {
  const t = getToken()
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  cfg.headers['Content-Type'] = 'application/json'
  return cfg
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      signOut()
      if (typeof window !== 'undefined') window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
export { setToken }
