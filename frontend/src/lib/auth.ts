import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '@/types'

interface AuthState {
  token: string | null
  role: Role | null
  email: string | null
  apiKey: string | null
  credits: number
  setAuth: (payload: { token: string, role: Role, email: string, apiKey: string, credits: number }) => void
  clear: () => void
  setCredits: (v: number) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      email: null,
      apiKey: null,
      credits: 0,
      setAuth: (p) => set({ token: p.token, role: p.role, email: p.email, apiKey: p.apiKey, credits: p.credits }),
      clear: () => set({ token: null, role: null, email: null, apiKey: null, credits: 0 }),
      setCredits: (v) => set({ credits: v })
    }),
    { name: 'slipwake-auth' }
  )
)

export const getToken = () => useAuth.getState().token
export const signOut = () => useAuth.getState().clear()
export const setToken = (token: string) => useAuth.setState({ token })