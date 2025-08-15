'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { verifySlipSchema } from '@/lib/validators'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth'

export default function Verify(){
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(verifySlipSchema) })
  const setCredits = useAuth(s=>s.setCredits)
  const onSubmit = async (v: any) => {
    const res = await api.post('/verify', v)
    // Backend returns new credits after deduction
    if (res.data?.credits !== undefined) setCredits(res.data.credits)
    alert(JSON.stringify(res.data, null, 2))
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl border rounded p-6">
      <h1 className="text-2xl font-semibold mb-4">ตรวจสอบสลิป</h1>
      <div className="mb-3">
        <label className="block text-sm">Slip Ref</label>
        <input className="border rounded w-full p-2" {...register('slipRef')} />
        {errors.slipRef && <p className="text-red-600 text-sm">{String(errors.slipRef.message)}</p>}
      </div>
      <div className="mb-3">
        <label className="block text-sm">จำนวนเงิน (THB)</label>
        <input type="number" step="0.01" className="border rounded w-full p-2" {...register('amount')} />
      </div>
      <div className="mb-4">
        <label className="block text-sm">วันที่โอน (YYYYMMDD)</label>
        <input className="border rounded w-full p-2" {...register('date')} />
      </div>
      <button disabled={isSubmitting} className="px-4 py-2 bg-black text-white rounded">ตรวจสอบ</button>
    </form>
  )