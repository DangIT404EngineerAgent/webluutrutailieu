'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EditDocument() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const docId = params.id

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    format: 'pdf',
    isPublic: true,
    ownerId: '',
    currentFilePath: '',
    currentPreviewPath: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      const { data: cats } = await supabase.from('categories').select('*').order('name')
      if (cats) setCategories(cats)

      // Fetch document
      const { data: doc, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId)
        .single()

      if (doc) {
        setFormData({
          title: doc.title || '',
          description: doc.description || '',
          categoryId: doc.category_id || '',
          format: doc.file_format || 'pdf',
          isPublic: doc.is_public,
          ownerId: doc.owner_id || '',
          currentFilePath: doc.file_path || '',
          currentPreviewPath: doc.preview_file_path || '',
        })
      }
      setLoading(false)
    }
    fetchData()
  }, [docId])

  const handleChange = (e) => {
    const value = e.target.type === 'radio'
      ? e.target.value === 'true'
      : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    let filePath = formData.currentFilePath
    let previewFilePath = formData.currentPreviewPath

    // Upload file mới nếu có
    const newFile = document.getElementById('newFile')?.files[0]
    if (newFile) {
      const fileExt = newFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const path = `documents/original/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, newFile, {
          contentType: newFile.type || 'application/octet-stream',
          upsert: false
        })

      if (uploadError) {
        setError('Lỗi upload file: ' + uploadError.message)
        setSaving(false)
        return
      }
      filePath = path

      // Nếu là PDF/Video, preview = file gốc
      if (!['word', 'powerpoint'].includes(formData.format)) {
        previewFilePath = path
      }
    }

    // Upload preview mới nếu có
    const newPreview = document.getElementById('newPreview')?.files[0]
    if (newPreview) {
      const previewName = `${Date.now()}-preview.pdf`
      const previewPath = `documents/preview/${previewName}`

      const { error: previewError } = await supabase.storage
        .from('documents')
        .upload(previewPath, newPreview, {
          contentType: newPreview.type || 'application/pdf',
          upsert: false
        })

      if (previewError) {
        setError('Lỗi upload preview: ' + previewError.message)
        setSaving(false)
        return
      }
      previewFilePath = previewPath
    }

    // Update document
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        title: formData.title,
        description: formData.description,
        file_path: filePath,
        file_format: formData.format,
        preview_file_path: previewFilePath,
        category_id: formData.categoryId || null,
        is_public: formData.isPublic,
        owner_id: !formData.isPublic ? (formData.ownerId || null) : null,
      })
      .eq('id', docId)

    if (updateError) {
      setError('Lỗi cập nhật: ' + updateError.message)
      setSaving(false)
      return
    }

    router.push('/admin/quan-ly-tai-lieu')
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <Link href="/admin/quan-ly-tai-lieu" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
          &larr; Quay lại
        </Link>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Chỉnh sửa Tài liệu</h1>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Tên tài liệu</label>
            <input type="text" id="title" name="title" className="form-input" value={formData.title} onChange={handleChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="category">Chuyên mục</label>
              <select id="category" name="categoryId" className="form-select" value={formData.categoryId} onChange={handleChange}>
                <option value="">-- Chọn --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="format">Định dạng</label>
              <select id="format" name="format" className="form-select" value={formData.format} onChange={handleChange}>
                <option value="pdf">PDF</option>
                <option value="word">Word</option>
                <option value="video">Video</option>
                <option value="powerpoint">PowerPoint</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Mô tả tài liệu</label>
            <textarea id="description" name="description" className="form-textarea" rows="4" value={formData.description} onChange={handleChange}></textarea>
          </div>

          <div className="form-group" style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem', background: 'var(--background)' }}>
            <label className="form-label">Quyền truy cập & Hiển thị (Public/Private)</label>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="isPublic" value="true" checked={formData.isPublic === true} onChange={handleChange} />
                <span>Công khai (Tất cả mọi người)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="isPublic" value="false" checked={formData.isPublic === false} onChange={handleChange} />
                <span>Riêng tư (Giao cho User)</span>
              </label>
            </div>

            {!formData.isPublic && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)' }}>
                <label className="form-label" htmlFor="owner">Gán cho người dùng (UUID)</label>
                <input type="text" id="owner" name="ownerId" className="form-input" placeholder="Nhập User ID (UUID)..." value={formData.ownerId} onChange={handleChange} />
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Thay đổi File đính kèm gốc</label>
            <div style={{ border: '2px dashed var(--border)', padding: '2rem', textAlign: 'center', borderRadius: '0.5rem', background: 'var(--background)' }}>
              <p style={{ margin: '0 0 1rem 0' }}>File hiện tại: <strong>{formData.currentFilePath?.split('/').pop() || 'Không có'}</strong></p>
              <input type="file" id="newFile" style={{ display: 'block', margin: '0 auto' }} />
            </div>
          </div>

          {['word', 'powerpoint'].includes(formData.format) && (
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label" style={{ color: '#d97706' }}>Thay đổi Bản xem trước (PDF)</label>
              <div style={{ border: '2px dashed #f59e0b', padding: '2rem', textAlign: 'center', borderRadius: '0.5rem', background: 'rgba(245, 158, 11, 0.05)' }}>
                <p style={{ margin: '0 0 1rem 0', color: '#b45309' }}>
                  File hiện tại: <strong>{formData.currentPreviewPath?.split('/').pop() || 'Không có'}</strong>
                </p>
                <input type="file" id="newPreview" accept=".pdf" style={{ display: 'block', margin: '0 auto' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '0.75rem 2rem', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <Link href="/admin/quan-ly-tai-lieu" className="btn btn-outline" style={{ padding: '0.75rem 2rem' }}>Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
