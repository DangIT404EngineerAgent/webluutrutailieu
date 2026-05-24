'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function YeuCauTaiLieu() {
  const { user, supabase } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      setError('Bạn cần đăng nhập để gửi yêu cầu.')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData(e.target)

    try {
      // 1. Insert yêu cầu vào bảng document_requests
      const { data: request, error: insertError } = await supabase
        .from('document_requests')
        .insert([{
          user_id: user.id,
          title: formData.get('title'),
          description: formData.get('description'),
          target_level: formData.get('classLevel') || null,
          format_needed: formData.get('format') || null,
          deadline: formData.get('deadline') || null,
          budget: formData.get('budget') || null,
        }])
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        setError('Lỗi gửi yêu cầu: ' + insertError.message)
        setLoading(false)
        return
      }

      // 2. Tạo phòng chat private gắn với request này
      if (request) {
        const { error: chatError } = await supabase
          .from('chat_rooms')
          .insert([{
            type: 'private',
            name: `Chat YC: ${formData.get('title')}`,
            request_id: request.id,
            user_id: user.id,
          }])

        if (chatError) {
          console.error('Lỗi tạo phòng chat:', chatError.message)
          // Không block flow, vẫn redirect
        }
      }

      // 3. Redirect đến lịch sử yêu cầu
      router.push('/yeu-cau/lich-su')
    } catch (err) {
      console.error('Submit error:', err)
      setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Yêu Cầu Tài Liệu Riêng</h1>
          <p className="page-description">Bạn không tìm thấy tài liệu mong muốn? Hãy để chúng tôi biên soạn riêng cho bạn.</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Tiêu đề yêu cầu *</label>
              <input type="text" id="title" name="title" className="form-input" placeholder="VD: Bộ đề ôn thi Toán lớp 12..." required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Mô tả chi tiết *</label>
              <textarea id="description" name="description" className="form-input" rows="5" placeholder="Mô tả thật rõ nội dung bạn cần..." required style={{ resize: 'vertical' }}></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="classLevel">Cấp học / Lớp</label>
                <select id="classLevel" name="classLevel" className="form-select">
                  <option value="">-- Chọn --</option>
                  <option value="Lớp 1-5">Lớp 1-5</option>
                  <option value="Lớp 6-9">Lớp 6-9</option>
                  <option value="Lớp 10-12">Lớp 10-12</option>
                  <option value="Đại học">Đại học</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="format">Định dạng mong muốn</label>
                <select id="format" name="format" className="form-select">
                  <option value="">-- Chọn --</option>
                  <option value="word">Word (.docx)</option>
                  <option value="pdf">PDF</option>
                  <option value="powerpoint">PowerPoint (.pptx)</option>
                  <option value="video">Video bài giảng</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="deadline">Hạn chót (nếu có)</label>
                <input type="date" id="deadline" name="deadline" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="budget">Ngân sách dự kiến</label>
                <input type="text" id="budget" name="budget" className="form-input" placeholder="VD: 200.000đ" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Cho Admin'}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
