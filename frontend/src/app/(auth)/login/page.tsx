'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validators'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { LoginResponse } from '@/types'

export default function Login(){
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema) })
  const setAuth = useAuth(s => s.setAuth)
  
  const onSubmit = async (data: any) => {
    const res = await api.post<LoginResponse>('/auth/login', data)
    const { token, user } = res.data
    setAuth({ token, role: user.role as any, email: user.email, apiKey: user.apiKey, credits: user.credits })
    window.location.href = '/dashboard'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full border rounded p-6">
      <h1 className="text-2xl font-semibold mb-4">เข้าสู่ระบบ</h1>
      <div className="mb-3">
        <label className="block text-sm">อีเมล</label>
        <input className="border rounded w-full p-2" {...register('email')} />
        {errors.email && <p className="text-red-600 text-sm">{String(errors.email.message)}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-sm">รหัสผ่าน</label>
        <input type="password" className="border rounded w-full p-2" {...register('password')} />
        {errors.password && <p className="text-red-600 text-sm">{String(errors.password.message)}</p>}
      </div>
      <button disabled={isSubmitting} className="px-4 py-2 bg-black text-white rounded">{isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>
    </form>
  )
}