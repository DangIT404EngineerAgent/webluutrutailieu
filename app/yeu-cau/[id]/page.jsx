'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ChiTietYeuCauUser() {
  const { user, supabase } = useAuth()
  const params = useParams()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequest = async () => {
      const { data } = await supabase
        .from('document_requests')
        .select('*, fulfilled_doc:documents(id, title, file_path, file_format)')
        .eq('id', params.id)
        .single()

      if (data) setRequest(data)
      setLoading(false)
    }
    fetchRequest()
  }, [params.id])

  const handleDownloadResult = async () => {
    if (!request?.fulfilled_doc?.file_path) return

    let ext = ''
    const formatLower = request.fulfilled_doc.file_format?.toLowerCase() || ''
    if (formatLower === 'word') ext = '.docx'
    else if (formatLower === 'pdf') ext = '.pdf'
    else if (formatLower === 'powerpoint') ext = '.pptx'
    else if (formatLower === 'video') ext = '.mp4'

    const title = request.fulfilled_doc.title || 'Tai_lieu'
    const downloadName = title.toLowerCase().endsWith(ext) ? title : `${title}${ext}`

    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(request.fulfilled_doc.file_path, 300, {
        download: downloadName
      })

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#64748b'
      case 'discussing': return '#f59e0b'
      case 'processing': return '#3b82f6'
      case 'completed': return '#10b981'
      case 'rejected': return '#ef4444'
      default: return '#64748b'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt'
      case 'discussing': return 'Đang thảo luận'
      case 'processing': return 'Đang xử lý'
      case 'completed': return 'Hoàn thành'
      case 'rejected': return 'Từ chối'
      default: return status
    }
  }

  const statusSteps = ['pending', 'discussing', 'processing', 'completed']
  const currentStepIndex = request ? statusSteps.indexOf(request.status) : -1

  return (
    <ProtectedRoute>
    {loading ? (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}><p>Đang tải...</p></div>
    ) : !request ? (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}><h2>Không tìm thấy yêu cầu</h2></div>
    ) : (
    <div className="container" style={{ padding: '4rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <Link href="/yeu-cau/lich-su" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '2rem', fontWeight: '500', textDecoration: 'none' }}>
          &larr; Quay lại danh sách
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Chi tiết yêu cầu</h1>
            <p style={{ color: 'var(--text-muted)' }}>Ngày tạo: {new Date(request.created_at).toLocaleDateString('vi-VN')}</p>
          </div>
          <span style={{
            background: `${getStatusColor(request.status)}20`,
            color: getStatusColor(request.status),
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}>
            {getStatusLabel(request.status)}
          </span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Timeline */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 1rem' }}>
            <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: 'var(--border)', zIndex: 0 }}></div>
            {currentStepIndex >= 0 && (
              <div style={{ position: 'absolute', top: '15px', left: '10%', width: `${(currentStepIndex / (statusSteps.length - 1)) * 80}%`, height: '2px', background: 'var(--primary)', zIndex: 0 }}></div>
            )}

            {statusSteps.map((step, index) => {
              const isActive = index <= currentStepIndex
              return (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: isActive ? 'var(--primary)' : 'white',
                    border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                    color: isActive ? 'white' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '0.9rem'
                  }}>
                    {index + 1}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: isActive ? 'var(--text)' : 'var(--text-muted)', fontWeight: isActive ? '600' : 'normal' }}>
                    {getStatusLabel(step)}
                  </span>
                </div>
              )
            })}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

          {/* Info Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Thông tin chung</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
                <li><strong>Tiêu đề:</strong> {request.title}</li>
                <li><strong>Cấp học:</strong> {request.target_level}</li>
                <li><strong>Định dạng:</strong> {request.format_needed}</li>
                <li><strong>Hạn chót:</strong> {request.deadline ? new Date(request.deadline).toLocaleDateString('vi-VN') : 'Không có'}</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Tài chính & Liên hệ</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
                <li><strong>Ngân sách:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{request.budget || 'Chưa có'}</span></li>
                <li>
                  <strong>Thanh toán:</strong>{' '}
                  {request.is_paid
                    ? <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Đã thanh toán</span>
                    : <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Chưa thanh toán</span>}
                </li>
                <li style={{ marginTop: '0.5rem' }}>
                  <Link href={`/chat-rieng/${request.id}`} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                    💬 Nhắn tin với Admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Mô tả chi tiết</h3>
            <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '0.5rem', lineHeight: '1.6' }}>
              {request.description}
            </div>
          </div>

          {/* Kết quả */}
          {request.status === 'completed' && request.fulfilled_doc ? (
            <div style={{ background: '#ecfdf5', border: '1px solid #34d399', padding: '1.5rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#065f46', marginBottom: '0.25rem' }}>Tài liệu đã hoàn thành!</h3>
                <p style={{ color: '#047857', fontSize: '0.9rem' }}>Admin đã tải lên kết quả: {request.fulfilled_doc.title}</p>
              </div>
              <button onClick={handleDownloadResult} className="btn btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }}>
                ⬇️ Tải tài liệu về
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '0.5rem', color: 'var(--text-muted)' }}>
              <p>Tài liệu đang trong quá trình xử lý.</p>
              <p style={{ fontSize: '0.9rem' }}>Vui lòng theo dõi tiến độ hoặc nhắn tin với Admin nếu có thay đổi.</p>
            </div>
          )}

        </div>
      </div>
    </div>
    )}
    </ProtectedRoute>
  )
}
