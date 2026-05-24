'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function HeaderNav() {
  const { user, profile, loading, signOut, isAdmin } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="header">
      <div className="container header-content">
        <Link href="/" className="logo">EduDocs</Link>
        <nav className="nav-links">
          <Link href="/kho-tai-lieu" className="nav-link">Kho tài liệu</Link>
          {user && (
            <>
              <Link href="/tai-lieu-cua-toi" className="nav-link">Tài liệu của tôi</Link>
              <Link href="/yeu-cau" className="nav-link">Yêu cầu tài liệu</Link>
              <Link href="/chat-chung" className="nav-link">Cộng đồng</Link>
            </>
          )}
          {isAdmin && (
            <Link href="/admin/dashboard" className="nav-link" style={{ color: 'var(--primary)', fontWeight: '600' }}>
              ⚙️ Admin
            </Link>
          )}
        </nav>
        <div>
          {loading ? (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>...</span>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/ho-so" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}>
                  {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
              </Link>
              <button onClick={handleSignOut} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/dang-nhap" className="btn btn-primary">Đăng nhập</Link>
              <Link href="/dang-ky" className="btn btn-outline">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
