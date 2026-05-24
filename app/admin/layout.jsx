'use client'

import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute adminOnly={true}>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', background: 'var(--background)' }}>
        {/* Sidebar Admin */}
        <aside style={{ width: '250px', background: 'white', borderRight: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>Admin Portal</h2>
          
          <Link href="/admin/dashboard" className="nav-link" style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'var(--card-bg)' }}>
            📊 Dashboard
          </Link>
          <Link href="/admin/quan-ly-yeu-cau" className="nav-link" style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
            📝 Quản lý Yêu cầu
          </Link>
          <Link href="/admin/quan-ly-tai-lieu" className="nav-link" style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
            📚 Quản lý Tài liệu
          </Link>
          <Link href="/admin/quan-ly-nguoi-dung" className="nav-link" style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
            👥 Người dùng & Thanh toán
          </Link>
          <Link href="/admin/quan-ly-danh-muc" className="nav-link" style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
            🏷️ Quản lý Danh mục
          </Link>
          <Link href="/admin/chat" className="nav-link" style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: '#ecfdf5', color: '#059669', fontWeight: '500' }}>
            💬 Hộp thư (Inbox)
          </Link>
          
          <div style={{ marginTop: 'auto' }}>
            <Link href="/" style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: '#ef4444', textDecoration: 'none', fontWeight: '500' }}>
              🚪 Về Trang chủ
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
