'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function LichSuYeuCau() {
  const { user, supabase } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const fetchRequests = async () => {
      const { data } = await supabase
        .from('document_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data && !cancelled) setRequests(data)
      if (!cancelled) setLoading(false)
    }
    fetchRequests()

    return () => { cancelled = true }
  }, [user?.id])

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return { bg: '#f1f5f9', color: '#64748b', label: 'Chờ duyệt' }
      case 'discussing': return { bg: '#fef3c7', color: '#d97706', label: 'Đang thảo luận' }
      case 'processing': return { bg: '#dbeafe', color: '#2563eb', label: 'Đang xử lý' }
      case 'completed': return { bg: '#d1fae5', color: '#059669', label: 'Hoàn thành' }
      case 'rejected': return { bg: '#fee2e2', color: '#dc2626', label: 'Từ chối' }
      default: return { bg: '#f1f5f9', color: '#64748b', label: status }
    }
  }

  return (
    <ProtectedRoute>
    {loading ? (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}><p>Đang tải...</p></div>
    ) : (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Lịch Sử Yêu Cầu</h1>
          <p className="page-description" style={{ margin: 0 }}>Theo dõi tiến độ các tài liệu bạn đã yêu cầu Admin biên soạn.</p>
        </div>
        <Link href="/yeu-cau" className="btn btn-primary">
          + Tạo Yêu Cầu Mới
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--background)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: '600' }}>Tiêu đề yêu cầu</th>
                <th style={{ padding: '1rem', fontWeight: '600' }}>Định dạng</th>
                <th style={{ padding: '1rem', fontWeight: '600' }}>Ngày gửi</th>
                <th style={{ padding: '1rem', fontWeight: '600' }}>Trạng thái</th>
                <th style={{ padding: '1rem', fontWeight: '600', textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Bạn chưa có yêu cầu nào.
                  </td>
                </tr>
              ) : requests.map((req) => {
                const statusStyle = getStatusStyle(req.status)
                return (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{req.title}</td>
                    <td style={{ padding: '1rem' }}><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{req.format_needed}</span></td>
                    <td style={{ padding: '1rem' }}>{new Date(req.created_at).toLocaleDateString('vi-VN')}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        {statusStyle.label}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Link href={`/yeu-cau/${req.id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    )}
    </ProtectedRoute>
  )
}
