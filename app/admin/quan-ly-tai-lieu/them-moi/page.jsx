'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'

export default function ThemMoiTaiLieu() {
  const supabase = createClient()
  const { user } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    format: 'pdf',
    description: '',
    isPublic: true,
    ownerId: ''
  })

  // Fetch danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fileInput = document.getElementById('mainFile')
    const previewInput = document.getElementById('previewFile')

    if (!fileInput.files[0]) {
      setError('Vui lòng chọn file đính kèm.')
      setLoading(false)
      return
    }

    const file = fileInput.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `documents/original/${fileName}`

    // 1. Upload file gốc lên Storage (gửi kèm contentType để Supabase lưu đúng MIME type)
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      })

    if (uploadError) {
      setError('Lỗi upload file: ' + uploadError.message)
      setLoading(false)
      return
    }

    // 2. Xử lý preview file
    let previewFilePath = filePath // Mặc định PDF/Video thì preview = file gốc

    if (['word', 'powerpoint'].includes(formData.format)) {
      // Cần upload bản preview PDF riêng
      if (!previewInput?.files[0]) {
        setError('Vui lòng upload bản xem trước PDF cho định dạng ' + formData.format)
        setLoading(false)
        return
      }

      const previewFile = previewInput.files[0]
      const previewFileName = `${Date.now()}-preview.pdf`
      const previewPath = `documents/preview/${previewFileName}`

      const { error: previewUploadError } = await supabase.storage
        .from('documents')
        .upload(previewPath, previewFile, {
          contentType: previewFile.type || 'application/pdf',
          upsert: false
        })

      if (previewUploadError) {
        setError('Lỗi upload file preview: ' + previewUploadError.message)
        setLoading(false)
        return
      }

      previewFilePath = previewPath
    }

    // 3. Tìm owner_id nếu là private
    let ownerId = null
    if (!formData.isPublic && formData.ownerId) {
      // Tìm user theo email trong profiles (join auth.users)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', formData.ownerId)
        .single()

      if (profiles) {
        ownerId = profiles.id
      } else {
        // Thử tìm bằng email - fallback
        ownerId = formData.ownerId
      }
    }

    // 4. Insert vào bảng documents
    const { error: insertError } = await supabase
      .from('documents')
      .insert([{
        title: formData.title,
        description: formData.description,
        file_path: filePath,
        file_format: formData.format,
        preview_file_path: previewFilePath,
        category_id: formData.categoryId || null,
        is_public: formData.isPublic,
        owner_id: ownerId,
        created_by: user.id,
      }])

    if (insertError) {
      setError('Lỗi lưu tài liệu: ' + insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin/quan-ly-tai-lieu')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <Link href="/admin/quan-ly-tai-lieu" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
          &larr; Hủy
        </Link>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Tải lên Tài liệu mới</h1>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="form-group">
            <label className="form-label">Tên tài liệu <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="VD: Giáo án PPT Bài 15..."
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Danh mục bài học <span style={{ color: 'red' }}>*</span></label>
              <select name="categoryId" className="form-input" value={formData.categoryId} onChange={handleChange} required>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name} {cat.description ? `(${cat.description})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Định dạng file <span style={{ color: 'red' }}>*</span></label>
              <select name="format" className="form-input" value={formData.format} onChange={handleChange}>
                <option value="pdf">PDF</option>
                <option value="powerpoint">PowerPoint</option>
                <option value="word">Word</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả tài liệu</label>
            <textarea
              name="description"
              className="form-input"
              rows="4"
              placeholder="Nhập mô tả chi tiết nội dung tài liệu..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                style={{ width: '18px', height: '18px' }}
              />
              Tài liệu Công khai (Public)
            </label>
            <p style={{ margin: '0.5rem 0 0 1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Nếu chọn, tất cả mọi người có thể thấy và tải tài liệu này. Bỏ chọn để biến thành tài liệu Riêng tư.
            </p>
          </div>

          {!formData.isPublic && (
            <div className="form-group" style={{ padding: '1rem', border: '1px dashed var(--primary)', borderRadius: '0.5rem', background: 'rgba(37, 99, 235, 0.05)' }}>
              <label className="form-label">User ID người sở hữu</label>
              <input
                type="text"
                name="ownerId"
                className="form-input"
                placeholder="Nhập User ID (UUID) của người sẽ nhận tài liệu này..."
                value={formData.ownerId}
                onChange={handleChange}
                required={!formData.isPublic}
              />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Chỉ người dùng có ID này mới thấy file trong phần "Tài liệu của tôi".
              </p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">File đính kèm (Gốc) <span style={{ color: 'red' }}>*</span></label>
            <input type="file" id="mainFile" className="form-input" required />
            {['word', 'powerpoint'].includes(formData.format) && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Vui lòng tải lên file gốc (.docx, .pptx) tại đây.
              </p>
            )}
          </div>

          {['word', 'powerpoint'].includes(formData.format) && (
            <div className="form-group" style={{ padding: '1rem', border: '1px dashed #f59e0b', borderRadius: '0.5rem', background: 'rgba(245, 158, 11, 0.05)' }}>
              <label className="form-label" style={{ color: '#d97706' }}>Bản xem trước (PDF) <span style={{ color: 'red' }}>*</span></label>
              <input type="file" id="previewFile" accept=".pdf" className="form-input" required />
              <p style={{ fontSize: '0.85rem', color: '#b45309', marginTop: '0.5rem' }}>
                Do định dạng gốc là {formData.format === 'word' ? 'Word' : 'PowerPoint'}, cần có một bản PDF để hiển thị khung xem trước trên web.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 2rem', fontSize: '1.1rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Đang tải lên...' : 'Tải tài liệu lên'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
