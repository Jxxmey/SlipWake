import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import '../globals.css'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <Navbar />
        <main className="mx-auto max-w-6xl p-6">{children}</main>
        <Footer />
      </body>
    </html>
  )
}