'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function HoSo() {
  const { user, profile, supabase } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
  })

  useEffect(() => {
    if (profile && user) {
      setFormData({
        fullName: profile.full_name || '',
        email: user.email || '',
        role: profile.role || 'student',
      })
    }
  }, [profile, user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: formData.fullName })
      .eq('id', user.id)

    if (error) {
      setMessage('Lỗi: ' + error.message)
    } else {
      setMessage('Đã cập nhật thông tin thành công!')
      setIsEditing(false)
    }
    setLoading(false)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setMessage('')

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/avatar.${fileExt}`

    // Upload lên storage bucket "avatars"
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setMessage('Lỗi upload ảnh: ' + uploadError.message)
      setLoading(false)
      return
    }

    // Lấy public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Cập nhật profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    if (updateError) {
      setMessage('Lỗi cập nhật avatar: ' + updateError.message)
    } else {
      setMessage('Đã cập nhật ảnh đại diện!')
    }
    setLoading(false)
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên'
      case 'teacher': return 'Giáo viên'
      case 'student': return 'Học sinh'
      default: return role
    }
  }

  return (
    <ProtectedRoute>
      <div className="container" style={{ padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Hồ Sơ Cá Nhân</h1>

          {message && (
            <div style={{
              background: message.startsWith('Lỗi') ? '#fef2f2' : '#ecfdf5',
              color: message.startsWith('Lỗi') ? '#dc2626' : '#059669',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              border: `1px solid ${message.startsWith('Lỗi') ? '#fecaca' : '#a7f3d0'}`
            }}>
              {message}
            </div>
          )}

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Avatar Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: profile?.avatar_url
                  ? `url(${profile.avatar_url}) center/cover`
                  : 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                overflow: 'hidden',
              }}>
                {!profile?.avatar_url && (formData.fullName.charAt(0) || '?')}
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{formData.fullName || 'Chưa cập nhật'}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Vai trò: <strong style={{ color: 'var(--primary)' }}>{getRoleLabel(formData.role)}</strong>
                </p>
                <label className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                  Đổi ảnh đại diện
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            {/* Info Form */}
            <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-input"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email (Không thể đổi)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    disabled
                    style={{ background: 'var(--background)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                {isEditing ? (
                  <>
                    <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={() => setIsEditing(true)}>
                    Chỉnh sửa hồ sơ
                  </button>
                )}
              </div>
            </form>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
