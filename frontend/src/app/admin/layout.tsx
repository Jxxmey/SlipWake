'use client'
import AdminGuard from '@/components/admin/admin-guard'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import '../globals.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <Navbar />
        <AdminGuard>
          <main className="mx-auto max-w-7xl p-6">{children}</main>
        </AdminGuard>
        <Footer />
      </body>
    </html>
  )
}