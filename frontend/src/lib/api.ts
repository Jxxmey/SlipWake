// src/lib/api.ts
import axios from 'axios'
import { getToken, signOut, setToken } from './auth'

/** ใช้ .env ถ้ามี; ถ้าไม่มี ให้ fallback เป็น origin ปัจจุบัน + /api (ใช้ได้ดีตอน dev + proxy) */
function resolveBaseURL() {
  const fromEnv = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv

  if (typeof window !== 'undefined') {
    // fallback: https://your-frontend-origin/api
    return `${window.location.origin}/api`
  }
  // SSR fallback (ควรตั้ง .env เสมอ)
  return 'http://localhost:4000/api'
}

let baseURL = resolveBaseURL()

// เตือน Mixed Content (หน้า https แต่ baseURL เป็น http)
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && baseURL.startsWith('http://')) {
  // แค่เตือน ไม่เปลี่ยนค่าอัตโนมัติ เพื่อเลี่ยงยิงผิดระบบ
  console.warn(
    '[api] Mixed Content warning: You are on HTTPS but NEXT_PUBLIC_API_BASE_URL is HTTP. Use HTTPS to avoid Network Error.'
  )
}

const api = axios.create({
  baseURL,            // ตัวอย่างที่ถูก: https://slipwake.onrender.com/api
  timeout: 15000,
  withCredentials: false,
})

// ---- เพิ่ม header อัตโนมัติ (JWT + JSON + API Key ถ้ามี) ----
api.interceptors.request.use((cfg) => {
  const token = getToken()
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  cfg.headers['Content-Type'] = 'application/json'

  const apiKey = (typeof window !== 'undefined') ? localStorage.getItem('x-api-key') : null
  if (apiKey) cfg.headers['x-api-key'] = apiKey

  return cfg
})

// ---- จัดการ error มาตรฐาน + เคส 401 ----
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // แจกแจง error เพื่อดีบักง่ายขึ้น
    const status = err?.response?.status
    const url = err?.config?.url
    if (err.code === 'ERR_NETWORK') {
      console.error('[api] Network Error → ตรวจ HTTPS/CORS/ปลายทางล่ม', { baseURL, url, err })
    } else if (status) {
      console.error(`[api] HTTP ${status} on ${url}`, err?.response?.data || '')
    } else {
      console.error('[api] Unknown axios error', err)
    }

    if (status === 401) {
      signOut()
      if (typeof window !== 'undefined') window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// helper สำหรับตั้ง/ล้าง API Key ฝั่ง client
export function setApiKey(key?: string) {
  if (typeof window === 'undefined') return
  if (key) localStorage.setItem('x-api-key', key)
  else localStorage.removeItem('x-api-key')
}

// export ไว้ใช้ตอน login/register
export { setToken }
export default api

// log ให้เห็นชัด ๆ ว่าตอนรันจริงยิงไปที่ไหน
if (typeof window !== 'undefined') {
  // จะเห็นใน DevTools → Console
  console.log('[api] baseURL =', baseURL)
}
