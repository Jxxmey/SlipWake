export default function Docs(){
  return (
    <article className="prose">
      <h1>API Quickstart</h1>
      <ol>
        <li>สมัครสมาชิก → รับ API Key</li>
        <li>ล็อกอิน → รับ JWT</li>
        <li>เรียก <code>/routes/verifySlip</code> พร้อม Amount & Slip Ref</li>
        <li>เรียก <code>/routes/generateQR</code> เพื่อสร้าง QR</li>
      </ol>
    </article>
  )
}