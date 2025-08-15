'use client'
import api from '@/lib/api'
import { useEffect, useState } from 'react'

export default function Settings(){
  const [cfg, setCfg] = useState<any>({ price_per_verify: 2, banner: '', maintenance: false })
  useEffect(()=>{ api.get('/admin/settings').then(r=>setCfg(r.data||cfg)) },[])
  const save = async () => { await api.put('/admin/settings', cfg); alert('บันทึกแล้ว') }
  return (
    <section className="max-w-xl grid gap-3">
      <h1 className="text-2xl font-semibold">ตั้งค่าระบบ</h1>
      <label className="text-sm">ราคา/ครั้ง (THB)</label>
      <input type="number" className="border rounded p-2" value={cfg.price_per_verify} onChange={e=>setCfg({...cfg, price_per_verify:Number(e.target.value)})} />
      <label className="text-sm">ประกาศ (Banner)</label>
      <input className="border rounded p-2" value={cfg.banner} onChange={e=>setCfg({...cfg, banner:e.target.value})} />
      <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={cfg.maintenance} onChange={e=>setCfg({...cfg, maintenance:e.target.checked})} /> โหมดปิดปรับปรุง</label>
      <button onClick={save} className="px-4 py-2 bg-black text-white rounded w-fit">บันทึก</button>
    </section>
  )
}