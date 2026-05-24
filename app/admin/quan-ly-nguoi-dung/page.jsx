'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function QuanLyNguoiDung() {
  const supabase = createClient()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProfiles = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setProfiles(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`Bạn có chắc muốn đổi vai trò thành "${newRole}"?`)) return

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (!error) {
      fetchProfiles()
    } else {
      alert('Lỗi: ' + error.message)
    }
  }

  const getRoleStyle = (role) => {
    switch (role) {
      case 'admin': return { bg: '#fef3c7', color: '#d97706', label: 'Quản trị viên' }
      case 'teacher': return { bg: '#dbeafe', color: '#2563eb', label: 'Giáo viên' }
      case 'student': return { bg: '#d1fae5', color: '#059669', label: 'Học sinh' }
      default: return { bg: '#f1f5f9', color: '#64748b', label: role }
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><p>Đang tải...</p></div>

  return (
    <div>
      <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Quản lý Người dùng</h1>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--background)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Họ Tên</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>User ID</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Vai trò</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Ngày tạo</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có người dùng nào.</td>
              </tr>
            ) : profiles.map(profile => {
              const roleStyle = getRoleStyle(profile.role)
              return (
                <tr key={profile.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--primary), #3b82f6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 'bold', fontSize: '0.85rem',
                      flexShrink: 0,
                    }}>
                      {!profile.avatar_url && (profile.full_name?.charAt(0) || '?')}
                    </div>
                    <span style={{ fontWeight: '500' }}>{profile.full_name || 'Chưa cập nhật'}</span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {profile.id.slice(0, 8)}...
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      background: roleStyle.bg, color: roleStyle.color,
                      padding: '0.25rem 0.75rem', borderRadius: '999px',
                      fontSize: '0.85rem', fontWeight: '600'
                    }}>
                      {roleStyle.label}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {new Date(profile.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={profile.role}
                      onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                      style={{ padding: '0.3rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                    >
                      <option value="student">Học sinh</option>
                      <option value="teacher">Giáo viên</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
