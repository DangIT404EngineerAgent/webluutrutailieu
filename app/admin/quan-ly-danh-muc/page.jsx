'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function QuanLyDanhMuc() {
  const supabase = createClient()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [newCat, setNewCat] = useState({ name: '', description: '' })
  const [editCat, setEditCat] = useState({ name: '', description: '' })

  // Fetch danh mục từ Supabase
  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*, documents:documents(count)')
      .order('created_at', { ascending: true })

    if (!error && data) {
      setCategories(data.map(cat => ({
        ...cat,
        count: cat.documents?.[0]?.count || 0
      })))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Thêm danh mục mới
  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newCat.name) return

    const { error } = await supabase
      .from('categories')
      .insert([{ name: newCat.name, description: newCat.description }])

    if (!error) {
      setNewCat({ name: '', description: '' })
      setIsAdding(false)
      fetchCategories()
    } else {
      alert('Lỗi: ' + error.message)
    }
  }

  // Sửa danh mục
  const handleEdit = async (id) => {
    const { error } = await supabase
      .from('categories')
      .update({ name: editCat.name, description: editCat.description })
      .eq('id', id)

    if (!error) {
      setEditingId(null)
      fetchCategories()
    } else {
      alert('Lỗi: ' + error.message)
    }
  }

  // Xóa danh mục
  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xoá danh mục này?')) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchCategories()
    } else {
      alert('Lỗi: ' + error.message)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Quản lý Danh mục</h1>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          + Thêm danh mục
        </button>
      </div>

      {isAdding && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Thêm danh mục mới</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Tên danh mục</label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: Bài 18 Ôn tập chủ đề Thực vật và động vật"
                value={newCat.name}
                onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả ngắn</label>
              <input
                type="text"
                className="form-input"
                value={newCat.description}
                onChange={e => setNewCat({ ...newCat, description: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsAdding(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary">Lưu danh mục</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--background)', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Tên danh mục</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Mô tả</th>
              <th style={{ padding: '1rem', fontWeight: '600', textAlign: 'center' }}>Số tài liệu</th>
              <th style={{ padding: '1rem', fontWeight: '600', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Đang tải...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Chưa có danh mục nào.
                </td>
              </tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>
                  {editingId === cat.id ? (
                    <input type="text" className="form-input" value={editCat.name} onChange={e => setEditCat({ ...editCat, name: e.target.value })} style={{ marginBottom: 0 }} />
                  ) : cat.name}
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                  {editingId === cat.id ? (
                    <input type="text" className="form-input" value={editCat.description} onChange={e => setEditCat({ ...editCat, description: e.target.value })} style={{ marginBottom: 0 }} />
                  ) : cat.description}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {cat.count}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {editingId === cat.id ? (
                    <>
                      <button className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', marginRight: '0.5rem' }} onClick={() => handleEdit(cat.id)}>
                        Lưu
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setEditingId(null)}>
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', marginRight: '0.5rem' }} onClick={() => { setEditingId(cat.id); setEditCat({ name: cat.name, description: cat.description || '' }) }}>
                        Sửa
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleDelete(cat.id)}>
                        Xoá
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
