'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/dang-nhap')
      return
    }

    if (adminOnly && !isAdmin) {
      router.push('/')
      return
    }
  }, [user, loading, isAdmin, adminOnly, router])

  // Đang tải auth state - hiển thị loading
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Đang tải...</p>
      </div>
    )
  }

  // Chưa đăng nhập - không render gì (đang redirect)
  if (!user) return null

  // Admin only nhưng không phải admin - không render (đang redirect)
  if (adminOnly && !isAdmin) return null

  return children
}
