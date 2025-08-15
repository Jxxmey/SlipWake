'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import api, { setToken } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { loginSchema, type LoginInput } from '@/lib/validators'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuth()
  const [visible, setVisible] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  })

  const onSubmit = async (data: LoginInput) => {
    setServerError(null)
    const res = await api.post('/auth/login', data)
    const { token, user } = res.data
    setToken(token)
    setAuth({ token, role: user.role, email: user.email, apiKey: user.apiKey, credits: user.credits })
    router.push('/dashboard')
  }

  return (
    <main className="fixed inset-0 bg-white text-neutral-900">
      <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2">
        <section className="hidden lg:flex items-center justify-center">
          <div className="w-full max-w-xl px-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zm0 2.06L6 7.5v6.99l6 3.37 6-3.37V7.5L12 5.06z"/></svg>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">SlipWake Console</h1>
            </div>
            <p className="text-neutral-600 leading-relaxed">
              เข้าสู่ระบบเพื่อจัดการ API Key, ตรวจสอบสลิป, ดูประวัติการใช้งาน และสร้าง Thai QR ได้จากที่เดียว
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-2xl font-semibold">99.9%</div>
                <div className="text-xs mt-1 text-neutral-500">Uptime</div>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-2xl font-semibold">2 THB</div>
                <div className="text-xs mt-1 text-neutral-500">ต่อการตรวจ</div>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-2xl font-semibold">K-API</div>
                <div className="text-xs mt-1 text-neutral-500">Kasikornbank</div>
              </div>
            </div>
          </div>
        </section>

        <section className="h-full w-full flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">เข้าสู่ระบบ</h2>
              <p className="text-neutral-600 text-sm mt-1">ยินดีต้อนรับกลับสู่แดชบอร์ดของคุณ</p>
            </div>

            {serverError && (
              <div className="mb-4 rounded-lg border border-neutral-300 bg-white text-neutral-800 px-3 py-2 text-sm">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">อีเมล</label>
                <input
                  type="email"
                  autoComplete="email"
                  className="w-full h-11 rounded-lg border border-neutral-300 bg-white px-3 text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-neutral-900/20"
                  placeholder="you@example.com"
                  {...register('email')}
                />
                {errors.email?.message && <p className="mt-1 text-xs text-red-600">{String(errors.email.message)}</p>}
              </div>

              <div>
                <label className="block text-sm mb-1">รหัสผ่าน</label>
                <div className="relative">
                  <input
                    type={visible ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="w-full h-11 rounded-lg border border-neutral-300 bg-white px-3 pr-10 text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-neutral-900/20"
                    placeholder="••••••••"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setVisible(v => !v)}
                    className="absolute inset-y-0 right-0 px-3 text-neutral-500 hover:text-neutral-800"
                    aria-label="toggle password"
                  >
                    {visible ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M12 6c-5 0-9 6-9 6s4 6 9 6 9-6 9-6-4-6-9-6zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M3.27 2 2 3.27 5.05 6.3A12.2 12.2 0 0 0 3 12s4 6 9 6c1.6 0 3.1-.44 4.46-1.15L20.73 22 22 20.73 3.27 2zM12 16a4 4 0 0 1-4-4c0-.47.08-.93.24-1.35l5.11 5.11c-.42.16-.88.24-1.35.24zM12 6c5 0 9 6 9 6a17.4 17.4 0 0 1-3.44 3.86l-1.46-1.46A9.9 9.9 0 0 0 20.1 12S16 6 12 6z"/></svg>
                    )}
                  </button>
                </div>
                {errors.password?.message && <p className="mt-1 text-xs text-red-600">{String(errors.password.message)}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full h-11 rounded-lg bg-neutral-900 px-4 font-medium text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
              </button>

              <div className="text-center text-sm text-neutral-600 mt-2">
                ยังไม่มีบัญชี? <a href="/register" className="underline underline-offset-4 hover:text-neutral-900">สมัครสมาชิก</a>
              </div>
            </form>

            <div className="mt-6 text-center">
              <a href="/" className="text-xs text-neutral-500 hover:text-neutral-800">กลับหน้าแรก</a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
