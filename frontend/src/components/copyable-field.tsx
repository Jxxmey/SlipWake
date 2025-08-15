'use client'
import { useState } from 'react'

export default function CopyableField({ label, value, masked }: { label: string, value: string, masked?: boolean }){
  const [show, setShow] = useState(false)
  const display = masked && !show ? value.replace(/.(?=.{4})/g,'•') : value
  return (
    <div className="border rounded p-3 flex items-center justify-between">
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-mono break-all">{display}</div>
      </div>
      <div className="flex gap-2">
        {masked && <button className="text-sm underline" onClick={()=>setShow(!show)}>{show?'ซ่อน':'แสดง'}</button>}
        <button className="text-sm underline" onClick={()=>navigator.clipboard.writeText(value)}>คัดลอก</button>
      </div>
    </div>
  )
}