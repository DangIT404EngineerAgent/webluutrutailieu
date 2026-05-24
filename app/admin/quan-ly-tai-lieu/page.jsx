'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function QuanLyTaiLieu() {
  const supabase = createClient()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDocuments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('documents')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setDocuments(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xoá tài liệu này?')) return

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchDocuments()
    } else {
      alert('Lỗi: ' + error.message)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ fontSize: '1.8rem', margin: 0 }}>Quản lý Tài liệu</h1>
        <Link href="/admin/quan-ly-tai-lieu/them-moi" className="btn btn-primary">+ Đăng tài liệu mới</Link>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--background)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Tên tài liệu</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Chuyên mục</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Định dạng</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Loại</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có tài liệu nào.</td>
              </tr>
            ) : documents.map(doc => (
              <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{doc.title}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                    {doc.categories?.name || 'Chưa phân loại'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{doc.file_format}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    background: doc.is_public ? '#d1fae5' : '#fef3c7',
                    color: doc.is_public ? '#059669' : '#d97706',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {doc.is_public ? 'Công khai' : 'Riêng tư'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <Link href={`/admin/quan-ly-tai-lieu/${doc.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', marginRight: '0.5rem' }}>
                    Sửa
                  </Link>
                  <button onClick={() => handleDelete(doc.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
