'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function AdminUsers(){
  const [users, setUsers] = useState<any[]>([])
  const [q, setQ] = useState('')
  const reload = () => api.get('/admin/users',{ params: { q } }).then(r=>setUsers(r.data))
  useEffect(() => { reload() }, [q])

  const setRole = async (id:string, role:string) => { await api.put(`/admin/users/${id}/role`, { role }); reload() }
  const toggleBlock = async (id:string, blocked:boolean) => { await api.put(`/admin/users/${id}/block`, { blocked }); reload() }
  const adjustCredits = async (id:string) => {
    const v = prompt('จำนวนเครดิต (THB) ที่ต้องการตั้งค่าใหม่:')
    if(!v) return; await api.put(`/admin/users/${id}/credits`, { credits: Number(v) }); reload()
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">ผู้ใช้ทั้งหมด</h1>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="ค้นหาอีเมล/บริษัท" className="border rounded p-2 mb-4 w-full max-w-md" />
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">อีเมล</th>
              <th className="p-2 text-left">บทบาท</th>
              <th className="p-2 text-left">เครดิต</th>
              <th className="p-2 text-left">สถานะ</th>
              <th className="p-2 text-left">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.credits}</td>
                <td className="p-2">{u.blocked ? 'ถูกระงับ' : 'ปกติ'}</td>
                <td className="p-2 flex gap-2">
                  <button className="underline" onClick={()=>setRole(u._id, u.role==='admin'?'user':'admin')}>สลับบทบาท</button>
                  <button className="underline" onClick={()=>toggleBlock(u._id, !u.blocked)}>{u.blocked?'ปลดบล็อก':'บล็อก'}</button>
                  <button className="underline" onClick={()=>adjustCredits(u._id)}>ตั้งค่าเครดิต</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}