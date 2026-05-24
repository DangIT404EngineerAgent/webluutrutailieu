'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DangKy() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Đăng ký thành công → chuyển thẳng sang trang đăng nhập
    setLoading(false)
    router.push('/dang-nhap?registered=true')
  }

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '2rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Đăng Ký Tài Khoản</h1>
          <p className="page-description">Tham gia cộng đồng để chia sẻ và yêu cầu tài liệu</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Họ và Tên</label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder="Ví dụ: Nguyễn Văn A..."
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Nhập địa chỉ email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Tạo mật khẩu (ít nhất 6 ký tự)..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Xác nhận Mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              placeholder="Nhập lại mật khẩu..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginTop: '1rem', marginBottom: '1rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Đã có tài khoản? </span>
          <Link href="/dang-nhap" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
            Đăng nhập tại đây
          </Link>
        </div>
      </div>
    </div>
  )
}
