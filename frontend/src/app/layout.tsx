// src/app/layout.tsx
import './globals.css'
import { AuthProvider } from '@/lib/auth'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  )
}
