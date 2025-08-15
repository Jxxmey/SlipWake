'use client'
import AuthGuard from '@/components/auth/auth-guard'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import '../globals.css'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <Navbar />
        <AuthGuard>
          <main className="mx-auto max-w-6xl p-6">{children}</main>
        </AuthGuard>
        <Footer />
      </body>
    </html>
  )
}