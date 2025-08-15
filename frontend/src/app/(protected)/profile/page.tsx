'use client'
import { useAuth } from '@/lib/auth'
import api from '@/lib/api'
import { useState } from 'react'

export default function Profile(){
  const { email } = useAuth()
  const [saving, setSaving] = useState(false)

  const onSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())
    await api.put('/me', payload)
    setSaving(false)
    alert('บันทึกเรียบร้อย')
  }

  return (
    <form onSubmit={onSave} className="grid gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold">โปรไฟล์</h1>
      <div>
        <label className="block text-sm">อีเมล</label>
        <input defaultValue={email ?? ''} disabled className="border rounded p-2 w-full bg-gray-50" />
      </div>
      <div>
        <label className="block text-sm">ที่อยู่</label>
        <input name="address" className="border rounded p-2 w-full" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm">เบอร์โทร</label>
          <input name="phone_number" className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm">เลขผู้เสียภาษี (ถ้ามี)</label>
          <input name="tax_id" className="border rounded p-2 w-full" />
        </div>
      </div>
      <button disabled={saving} className="px-4 py-2 bg-black text-white rounded w-fit">{saving?'กำลังบันทึก...':'บันทึก'}</button>
    </form>
  )
}