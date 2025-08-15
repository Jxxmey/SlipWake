import { formatCurrency } from '@/lib/utils'
export default function Pricing(){
  return (
    <section>
      <h1 className="text-3xl font-semibold mb-6">แพ็กเกจ & ราคา</h1>
      <ul className="grid md:grid-cols-3 gap-6">
        <li className="border rounded p-6">
          <h3 className="font-semibold">Pay as you go</h3>
          <p className="text-sm text-gray-600">{formatCurrency(2)} ต่อการตรวจสอบ 1 ครั้ง</p>
        </li>
        <li className="border rounded p-6">
          <h3 className="font-semibold">Starter Bundle</h3>
          <p className="text-sm text-gray-600">1,000 เครดิต</p>
        </li>
      </ul>
    </section>
  )
}