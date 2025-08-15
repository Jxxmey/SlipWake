'use client'
import { useAuth } from '@/lib/auth'
import CopyableField from '@/components/copyable-field'
import { maskApiKey, formatCurrency } from '@/lib/utils'

export default function Dashboard(){
  const { email, apiKey, credits, role } = useAuth()
  return (
    <section className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 border rounded p-6">
        <h1 className="text-2xl font-semibold mb-2">ยินดีต้อนรับ {email}</h1>
        <p className="text-gray-600">บทบาท: {role}</p>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <CopyableField label="API Key" value={apiKey ?? ''} masked />
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">เครดิตคงเหลือ</div>
            <div className="text-2xl font-bold">{formatCurrency(credits)}</div>
          </div>
        </div>
      </div>
      <div className="border rounded p-6">
        <h2 className="font-semibold mb-2">ลัดไปยัง</h2>
        <ul className="list-disc ml-5 text-sm">
          <li><a className="underline" href="/verify">ตรวจสอบสลิป</a></li>
          <li><a className="underline" href="/qr">สร้าง QR</a></li>
          <li><a className="underline" href="/logs">ประวัติ</a></li>
        </ul>
      </div>
    </section>
  )
}