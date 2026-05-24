'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'

export default function AdminChiTietYeuCau() {
  const supabase = createClient()
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const reqId = params.id

  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRequest = async () => {
      const { data } = await supabase
        .from('document_requests')
        .select('*, profiles(full_name, id)')
        .eq('id', reqId)
        .single()

      if (data) setRequest(data)
      setLoading(false)
    }
    fetchRequest()
  }, [reqId])

  const handleStatusChange = async (newStatus) => {
    const { error } = await supabase
      .from('document_requests')
      .update({ status: newStatus })
      .eq('id', reqId)

    if (!error) {
      setRequest({ ...request, status: newStatus })
    }
  }

  const handleConfirmPayment = async () => {
    if (!confirm('Xác nhận đã nhận được thanh toán từ người dùng?')) return

    const { error } = await supabase
      .from('document_requests')
      .update({ is_paid: true, status: 'processing' })
      .eq('id', reqId)

    if (!error) {
      setRequest({ ...request, is_paid: true, status: 'processing' })
    }
  }

  // Upload file kết quả và hoàn thành yêu cầu
  const handleFulfill = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const fileInput = document.getElementById('resultFile')
    if (!fileInput?.files[0]) {
      setError('Vui lòng chọn file kết quả.')
      setSaving(false)
      return
    }

    const file = fileInput.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-result.${fileExt}`
    const filePath = `documents/original/${fileName}`

    // 1. Upload file lên Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      setError('Lỗi upload: ' + uploadError.message)
      setSaving(false)
      return
    }

    // 2. Tạo document riêng tư cho user
    const { data: newDoc, error: docError } = await supabase
      .from('documents')
      .insert([{
        title: `[Kết quả] ${request.title}`,
        description: `Tài liệu hoàn thành từ yêu cầu: ${request.title}`,
        file_path: filePath,
        file_format: request.format_needed || 'pdf',
        preview_file_path: filePath,
        is_public: false,
        owner_id: request.user_id,
        created_by: user.id,
      }])
      .select()
      .single()

    if (docError) {
      setError('Lỗi tạo tài liệu: ' + docError.message)
      setSaving(false)
      return
    }

    // 3. Cập nhật request: status=completed, fulfilled_document_id
    const { error: updateError } = await supabase
      .from('document_requests')
      .update({
        status: 'completed',
        fulfilled_document_id: newDoc.id,
      })
      .eq('id', reqId)

    if (updateError) {
      setError('Lỗi cập nhật yêu cầu: ' + updateError.message)
      setSaving(false)
      return
    }

    setRequest({ ...request, status: 'completed', fulfilled_document_id: newDoc.id })
    setSaving(false)
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

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><p>Đang tải...</p></div>
  if (!request) return <div style={{ textAlign: 'center', padding: '2rem' }}><h2>Không tìm thấy yêu cầu</h2></div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <Link href="/admin/quan-ly-yeu-cau" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
          &larr; Quay lại
        </Link>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Xử lý Yêu cầu</h1>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

        {/* Cột trái */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Thông tin chi tiết</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div><strong style={{ color: 'var(--text-muted)' }}>Người yêu cầu:</strong> <br />{request.profiles?.full_name || 'User'}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Ngày gửi:</strong> <br />{new Date(request.created_at).toLocaleDateString('vi-VN')}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Cấp học:</strong> <br />{request.target_level || 'N/A'}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Định dạng:</strong> <br />{request.format_needed}</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ color: 'var(--text-muted)' }}>Tiêu đề:</strong> <br />
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{request.title}</span>
            </div>

            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Mô tả:</strong>
              <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
                {request.description}
              </div>
            </div>
          </div>

          {request.status !== 'completed' && (
            <div className="card" style={{ border: '2px dashed var(--primary)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Trả kết quả (Upload File Riêng Tư)</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                File tải lên tại đây sẽ chỉ hiển thị cho người yêu cầu ({request.profiles?.full_name}).
              </p>
              <form onSubmit={handleFulfill} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="file" id="resultFile" className="form-input" />
                <button type="submit" className="btn btn-primary" disabled={!request.is_paid || saving} style={{ opacity: (!request.is_paid || saving) ? 0.6 : 1 }}>
                  {saving ? 'Đang xử lý...' : 'Tải lên & Chuyển trạng thái "Hoàn thành"'}
                </button>
                {!request.is_paid && (
                  <span style={{ fontSize: '0.85rem', color: '#ef4444', textAlign: 'center' }}>Vui lòng xác nhận thanh toán trước khi trả file.</span>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Cột phải */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Hành động</h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Trạng thái hiện tại</label>
              <select
                className="form-input"
                value={request.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{ fontWeight: 'bold', color: 'var(--primary)' }}
              >
                <option value="pending">Chờ duyệt</option>
                <option value="discussing">Đang thảo luận</option>
                <option value="processing">Đang xử lý</option>
                <option value="completed">Hoàn thành</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>

            <div style={{ background: request.is_paid ? '#ecfdf5' : '#fef2f2', padding: '1rem', borderRadius: '0.5rem', border: `1px solid ${request.is_paid ? '#34d399' : '#fca5a5'}`, marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>Thanh toán:</span>
                {request.is_paid ? (
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>Đã thanh toán</span>
                ) : (
                  <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Chưa thanh toán</span>
                )}
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Ngân sách: <strong>{request.budget || 'Chưa có'}</strong></div>

              {!request.is_paid && (
                <button className="btn btn-primary" style={{ width: '100%', padding: '0.5rem' }} onClick={handleConfirmPayment}>
                  ✓ Xác nhận đã nhận tiền
                </button>
              )}
            </div>

            <Link href={`/chat-rieng/${request.id}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              💬 Mở phòng Chat riêng
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
