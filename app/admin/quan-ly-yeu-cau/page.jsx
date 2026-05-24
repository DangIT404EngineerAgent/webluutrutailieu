'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function QuanLyYeuCau() {
  const supabase = createClient()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('document_requests')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })

    if (data) setRequests(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const columns = [
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'discussing', label: 'Đang thảo luận' },
    { key: 'processing', label: 'Đang xử lý' },
    { key: 'completed', label: 'Đã hoàn thành' },
  ]

  const handleStatusChange = async (reqId, newStatus) => {
    const { error } = await supabase
      .from('document_requests')
      .update({ status: newStatus })
      .eq('id', reqId)

    if (!error) fetchRequests()
    else alert('Lỗi: ' + error.message)
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}><p>Đang tải...</p></div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Quản lý Yêu Cầu (Kanban Board)</h1>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflowX: 'auto', paddingBottom: '1rem' }}>
        {columns.map(column => {
          const columnRequests = requests.filter(r => r.status === column.key)
          return (
            <div key={column.key} style={{ flex: '0 0 320px', background: 'rgba(248, 250, 252, 0.8)', borderRadius: '1rem', padding: '1rem', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text)', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary)' }}>
                {column.label} ({columnRequests.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
                {columnRequests.map(req => (
                  <div key={req.id} className="card" style={{ padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {req.profiles?.full_name || 'User'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(req.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0', lineHeight: '1.3' }}>{req.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Ngân sách: <strong>{req.budget || 'Chưa có'}</strong>
                    </p>
                    <p style={{ fontSize: '0.85rem', color: req.is_paid ? '#059669' : '#dc2626', marginBottom: '1rem' }}>
                      {req.is_paid ? '✓ Đã thanh toán' : '✗ Chưa thanh toán'}
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Link href={`/admin/quan-ly-yeu-cau/${req.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', flex: 1, textAlign: 'center' }}>
                        📋 Chi tiết
                      </Link>
                      {column.key !== 'completed' && (
                        <select
                          style={{ flex: 1, padding: '0.25rem', fontSize: '0.8rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }}
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        >
                          <option value="pending">Chờ duyệt</option>
                          <option value="discussing">Đang thảo luận</option>
                          <option value="processing">Đang xử lý</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="rejected">Từ chối</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
