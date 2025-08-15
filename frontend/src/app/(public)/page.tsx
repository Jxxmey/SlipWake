export default function Page(){
  return (
    <section className="grid md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">ตรวจสอบสลิปโอนเงินด้วย K‑API</h1>
        <p className="text-lg mb-6">REST API พร้อมใช้งาน หักเครดิตอัตโนมัติ 2 บาท/ครั้ง สร้าง QR แบบแมนนวล และดูรายงานได้ทันที</p>
        <div className="flex gap-3">
          <a href="/register" className="px-4 py-2 bg-black text-white rounded">เริ่มต้นใช้งาน</a>
          <a href="/docs" className="px-4 py-2 border rounded">อ่านเอกสาร</a>
        </div>
      </div>
      <div className="bg-gray-50 border rounded p-6">
        <pre className="text-xs overflow-auto">{`curl -X POST $BASE/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"secret"}'`}</pre>
      </div>
    </section>
  )
}