'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    pendingRequests: 0,
    totalUsers: 0,
    totalDocuments: 0,
    completedRequests: 0,
  })
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      // Đếm yêu cầu pending
      const { count: pending } = await supabase
        .from('document_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Đếm người dùng
      const { count: users } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Đếm tài liệu
      const { count: docs } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })

      // Đếm yêu cầu hoàn thành
      const { count: completed } = await supabase
        .from('document_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      setStats({
        pendingRequests: pending || 0,
        totalUsers: users || 0,
        totalDocuments: docs || 0,
        completedRequests: completed || 0,
      })

      // Lấy 5 yêu cầu gần đây
      const { data: recent } = await supabase
        .from('document_requests')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5)

      if (recent) setRecentRequests(recent)
      setLoading(false)
    }

    fetchStats()
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><p>Đang tải...</p></div>

  return (
    <div>
      <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Tổng quan hệ thống</h1>

      {/* Thông kê */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Yêu cầu chờ duyệt</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pendingRequests}</p>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Người dùng</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalUsers}</p>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Tài liệu</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.totalDocuments}</p>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Đã hoàn thành</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.completedRequests}</p>
        </div>
      </div>

      {/* Yêu cầu gần đây */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Yêu cầu gần đây</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recentRequests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Chưa có yêu cầu nào.</p>
          ) : recentRequests.map((req, idx) => (
            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: idx < recentRequests.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <span style={{ fontWeight: '600' }}>{req.profiles?.full_name || 'User'}</span>
                {' yêu cầu: '}
                <em>"{req.title}"</em>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                {new Date(req.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
