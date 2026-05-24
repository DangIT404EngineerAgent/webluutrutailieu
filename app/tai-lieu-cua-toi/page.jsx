'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function TaiLieuCuaToi() {
  const { user, supabase } = useAuth()
  const [documents, setDocuments] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const fetchData = async () => {
      try {
        // Lấy tài liệu đã nhận
        const { data: docs, error: docsError } = await supabase
          .from('documents')
          .select('*, categories(name)')
          .eq('is_public', false)
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        if (docsError) console.error('Lỗi fetch tài liệu:', docsError.message)
        if (!cancelled) setDocuments(docs || [])

        // Lấy lịch sử yêu cầu
        const { data: reqs, error: reqsError } = await supabase
          .from('document_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (reqsError) console.error('Lỗi fetch requests:', reqsError.message)
        if (!cancelled) setRequests(reqs || [])
      } catch (err) {
        console.error('Lỗi không mong muốn:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()

    return () => { cancelled = true }
  }, [user?.id])

  const handleDownload = async (filePath, title, format) => {
    let ext = ''
    const formatLower = format?.toLowerCase() || ''
    if (formatLower === 'word') ext = '.docx'
    else if (formatLower === 'pdf') ext = '.pdf'
    else if (formatLower === 'powerpoint') ext = '.pptx'
    else if (formatLower === 'video') ext = '.mp4'

    const isInline = formatLower === 'pdf' || formatLower === 'video'
    const downloadName = title.toLowerCase().endsWith(ext) ? title : `${title}${ext}`

    let newTab = null
    if (isInline) {
      newTab = window.open('about:blank', '_blank')
    }

    const options = isInline ? {} : { download: downloadName }

    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 300, options)

    if (data?.signedUrl) {
      if (isInline && newTab) {
        newTab.location.href = data.signedUrl
      } else if (!isInline) {
        const a = document.createElement('a')
        a.href = data.signedUrl
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } else {
      if (newTab) newTab.close()
      alert('Lỗi tải file: ' + (error?.message || 'Không tìm thấy file'))
    }
  }

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
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Tài Liệu Của Tôi</h1>
            <p className="page-description">Quản lý tài liệu được cấp riêng và theo dõi yêu cầu của bạn.</p>
          </div>
          <Link href="/yeu-cau" className="btn btn-primary">
            + Tạo Yêu Cầu Mới
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Đang tải...</p>
          </div>
        ) : (
          <>
            {/* PHẦN TÀI LIỆU ĐÃ NHẬN */}
            <div style={{ marginTop: '2rem', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Tài liệu Admin đã gửi</h2>
              {documents.length > 0 ? (
                <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                  {documents.map((doc) => (
                    <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600' }}>
                            Đã nhận
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {doc.categories?.name || ''}
                          </span>
                        </div>
                        <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{doc.title}</h3>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                          <p>Định dạng: <strong>{doc.file_format?.toUpperCase()}</strong></p>
                          <p>Ngày nhận: <strong>{new Date(doc.created_at).toLocaleDateString('vi-VN')}</strong></p>
                        </div>
                      </div>
                      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <button onClick={() => handleDownload(doc.file_path, doc.title, doc.file_format)} className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                          ⬇️ Tải Xuống
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem auto' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Bạn chưa nhận được tài liệu nào</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
                    Hãy tạo <strong>Yêu cầu tài liệu</strong> gửi đến Admin.<br/>
                    Admin sẽ biên soạn và gửi lại tài liệu hoàn chỉnh cho bạn tại đây.
                  </p>
                </div>
              )}
            </div>

            {/* PHẦN LỊCH SỬ YÊU CẦU */}
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text)' }}>Tiến độ yêu cầu của bạn</h2>
                {requests.length > 0 && (
                  <Link href="/yeu-cau/lich-su" style={{ color: 'var(--primary)', fontSize: '0.95rem', fontWeight: '500', textDecoration: 'none' }}>
                    Xem chi tiết →
                  </Link>
                )}
              </div>
              
              {requests.length > 0 ? (
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
                        {requests.map((req) => {
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
                                <Link href={`/yeu-cau/${req.id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                  Xem & Chat
                                </Link>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', background: 'var(--background)' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Bạn chưa tạo yêu cầu tài liệu nào.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}
