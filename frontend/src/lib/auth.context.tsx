'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type AuthState = { token?: string|null; role?: string|null; email?: string|null; apiKey?: string|null; credits?: number|null }
type Ctx = { auth: AuthState; setAuth: (v: AuthState)=>void; clear: ()=>void; ready: boolean }

const KEY = 'token'
export const setToken = (t?: string|null) => { if (typeof window==='undefined') return; if (t) localStorage.setItem(KEY,t); else localStorage.removeItem(KEY) }
export const getToken = () => (typeof window==='undefined' ? null : localStorage.getItem(KEY))
export const signOut = () => setToken(null)

const AuthContext = createContext<Ctx|undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, _setAuth] = useState<AuthState>({})
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = getToken(); if (t) _setAuth(s => ({ ...s, token: t })); setReady(true) }, [])
  const value = useMemo<Ctx>(() => ({
    auth,
    ready,
    setAuth: (v) => { if (v?.token) setToken(v.token); else setToken(null); _setAuth(v) },
    clear: () => { setToken(null); _setAuth({}) },
  }), [auth, ready])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx }
