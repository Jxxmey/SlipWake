'use client'
import { useAuth } from '@/lib/auth'
import { useEffect } from 'react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { token, role } = useAuth()
  useEffect(() => {
    if (!token) window.location.href = '/login'
    if (role !== 'admin') window.location.href = '/dashboard'
  }, [token, role])
  if (!token || role !== 'admin') return null
  return <>{children}</>
}