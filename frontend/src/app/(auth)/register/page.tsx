'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '@/lib/validators'
import api from '@/lib/api'

export default function Register(){
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(registerSchema) })
  const type = watch('user_type')

  const onSubmit = async (data: any) => {
    await api.post('/auth/register', data)
    window.location.href = '/login'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full border rounded p-6">
      <h1 className="text-2xl font-semibold mb-4">สมัครสมาชิก</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm">ประเภทผู้ใช้</label>
          <select className="border rounded w-full p-2" {...register('user_type')}>
            <option value="individual">บุคคลธรรมดา</option>
            <option value="company">นิติบุคคล</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">อีเมล</label>
          <input className="border rounded w-full p-2" {...register('email')} />
          {errors.email && <p className="text-red-600 text-sm">{String(errors.email.message)}</p>}
        </div>
        {type === 'individual' ? <>
          <div>
            <label className="block text-sm">ชื่อ</label>
            <input className="border rounded w-full p-2" {...register('first_name')} />
          </div>
          <div>
            <label className="block text-sm">นามสกุล</label>
            <input className="border rounded w-full p-2" {...register('last_name')} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm">เลขบัตรประชาชน</label>
            <input className="border rounded w-full p-2" {...register('id_card_number')} />
          </div>
        </> : <>
          <div className="md:col-span-2">
            <label className="block text-sm">ชื่อบริษัท</label>
            <input className="border rounded w-full p-2" {...register('company_name')} />
          </div>
          <div>
            <label className="block text-sm">เลขผู้เสียภาษี</label>
            <input className="border rounded w-full p-2" {...register('tax_id')} />
          </div>
          <div>
            <label className="block text-sm">ชื่อสาขา (ถ้ามี)</label>
            <input className="border rounded w-full p-2" {...register('branch_name')} />
          </div>
        </>}
        <div className="md:col-span-2">
          <label className="block text-sm">ที่อยู่</label>
          <input className="border rounded w-full p-2" {...register('address')} />
        </div>
        <div>
          <label className="block text-sm">เบอร์โทร</label>
          <input className="border rounded w-full p-2" {...register('phone_number')} />
        </div>
        <div>
          <label className="block text-sm">รหัสผ่าน</label>
          <input type="password" className="border rounded w-full p-2" {...register('password')} />
        </div>
      </div>
      {errors.root && <p className="text-red-600 text-sm">{String(errors.root.message)}</p>}
      <button disabled={isSubmitting} className="mt-4 px-4 py-2 bg-black text-white rounded">{isSubmitting ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}</button>
    </form>
  )
}