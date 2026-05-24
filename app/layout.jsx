import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import HeaderNav from '@/components/HeaderNav'

export const metadata = {
  title: 'Trung Tâm Tài Liệu Giáo Dục',
  description: 'Kho tài liệu giáo dục và hệ thống yêu cầu tài liệu dành cho giáo viên và học sinh.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <HeaderNav />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
