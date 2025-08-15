'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth, getToken } from '@/lib/auth'
import api from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const { auth } = useAuth()
  const [ready, setReady] = useState(false)
  const [ok, setOk] = useState(false)

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
        setOk(true)
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.replace('/login')
        } else {
          setOk(true) // ไม่ใช่ 401 → อยู่ต่อ
        }
      }
    })()
  }, [ready, router])

  if (!ready || !ok) return null

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
    </div>
  )
}
