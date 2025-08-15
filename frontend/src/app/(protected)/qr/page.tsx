'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { qrSchema } from '@/lib/validators'
import api from '@/lib/api'

export default function QR(){
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(qrSchema) })
  const onSubmit = async (v: any) => {
    const res = await api.post('/qr', v, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `qr_${v.merchantId}_${v.amount}.png`
    a.click()
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl border rounded p-6">
      <h1 className="text-2xl font-semibold mb-4">สร้าง QR แบบแมนนวล</h1>
      <div className="mb-3">
        <label className="block text-sm">รหัสร้านค้า (Merchant ID)</label>
        <input className="border rounded w-full p-2" {...register('merchantId')} />
      </div>
      <div className="mb-4">
        <label className="block text-sm">จำนวนเงิน (THB)</label>
        <input type="number" step="0.01" className="border rounded w-full p-2" {...register('amount')} />
      </div>
      {errors.root && <p className="text-red-600 text-sm">{String(errors.root.message)}</p>}
      <button disabled={isSubmitting} className="px-4 py-2 bg-black text-white rounded">สร้างไฟล์ PNG</button>
    </form>
  )
}