'use client'
import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, getToken } from '@/lib/auth'

export default function Protected({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { auth, ready } = useAuth()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!ready) return
    const t = auth?.token || getToken()
    if (!t) router.replace('/login')
    else setOk(true)
  }, [ready, auth?.token, router])

  if (!ready || !ok) return null
  return <>{children}</>
}
