'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

export default function Navbar(){
  const { token } = useAuth()
  return (
    <nav className="border-b">
      <div className="mx-auto max-w-7xl p-4 flex items-center justify-between">
        <Link href="/" className="font-semibold">{process.env.NEXT_PUBLIC_APP_NAME}</Link>
        <div className="flex items-center gap-4">
          <Link href="/docs">Docs</Link>
          <Link href="/pricing">Pricing</Link>
          {token ? <Link href="/dashboard" className="px-3 py-1 rounded bg-black text-white">Dashboard</Link> : <>
            <Link href="/login">Login</Link>
            <Link href="/register" className="px-3 py-1 rounded bg-black text-white">Sign up</Link>
          </>}
        </div>
      </div>
    </nav>
  )
}