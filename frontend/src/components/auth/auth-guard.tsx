'use client'
import { useAuth } from '@/lib/auth'
import { useEffect } from 'react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  useEffect(() => {
    if (!token) window.location.href = '/login'
  }, [token])
  if (!token) return null
  return <>{children}</>
}