'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, getToken } from '@/lib/auth'
import api from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const { auth } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = auth?.token || getToken()
    if (!t) { router.replace('/login'); return }
    setReady(true)
  }, [auth?.token, router])

  useEffect(() => {
    if (!ready) return
    ;(async () => {
      try {
        await api.get('/auth/me')
      } catch {
        router.replace('/login')
      }
    })()
  }, [ready, router])

  if (!ready) return <div>Loading…</div>

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
    </div>
  )
}
