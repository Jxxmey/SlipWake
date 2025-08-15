'use client'
import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function AdminOverview(){
  const [stats, setStats] = useState<any>({})
  useEffect(() => { api.get('/admin/stats').then(r=>setStats(r.data)) }, [])
  return (
    <section className="grid md:grid-cols-4 gap-4">
      {['verifications_today','success_rate','revenue_thb','api_error_rate'].map((k) => (
        <div key={k} className="border rounded p-4">
          <div className="text-xs text-gray-500">{k}</div>
          <div className="text-2xl font-bold">{stats?.[k] ?? '-'}</div>
        </div>
      ))}
    </section>
  )
}