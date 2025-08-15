import '../globals.css'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <main className="mx-auto max-w-md p-6 min-h-screen flex items-center">{children}</main>
      </body>
    </html>
  )
}