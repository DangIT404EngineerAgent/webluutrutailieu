'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function KhoTaiLieu() {
  const supabase = createClient()
  const [documents, setDocuments] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterFormat, setFilterFormat] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const previewSupportedFormats = ['pdf', 'video', 'word', 'powerpoint']

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: cats, error: catError } = await supabase.from('categories').select('*').order('name')
        if (catError) {
          console.error('Lỗi fetch categories:', catError)
          if (!cancelled) setErrorMsg(catError.message)
        }
        if (cats && !cancelled) setCategories(cats)

        // Fetch public documents
        const { data: docs, error: docError } = await supabase
          .from('documents')
          .select('*, categories(name)')
          .eq('is_public', true)
          .order('created_at', { ascending: false })

        if (docError) {
          console.error('Lỗi fetch documents:', docError)
          if (!cancelled) setErrorMsg(docError.message)
        }
        if (!cancelled) setDocuments(docs || [])
      } catch (err) {
        console.error('Unexpected error during fetch:', err)
        if (!cancelled) setErrorMsg(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()

    return () => { cancelled = true }
  }, [])

  // Lọc tài liệu
  const filteredDocs = documents.filter(doc => {
    const matchSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = filterCategory === 'All' || doc.category_id === filterCategory
    const matchFormat = filterFormat === 'All' || doc.file_format?.toLowerCase() === filterFormat.toLowerCase()
    return matchSearch && matchCategory && matchFormat
  })

  // Phân trang
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentDocs = filteredDocs.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1) }
  const handleFilterCategoryChange = (e) => { setFilterCategory(e.target.value); setCurrentPage(1) }
  const handleFilterFormatChange = (e) => { setFilterFormat(e.target.value); setCurrentPage(1) }

  // Tải file gốc
  const handleDownload = async (filePath, title, format) => {
    let ext = ''
    const formatLower = format?.toLowerCase() || ''
    if (formatLower === 'word') ext = '.docx'
    else if (formatLower === 'pdf') ext = '.pdf'
    else if (formatLower === 'powerpoint') ext = '.pptx'
    else if (formatLower === 'video') ext = '.mp4'

    const downloadName = title.toLowerCase().endsWith(ext) ? title : `${title}${ext}`

    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 300, {
        download: downloadName
      })

    if (data?.signedUrl) {
      // Tạo thẻ a để mở tab mới tải file
      const a = document.createElement('a')
      a.href = data.signedUrl
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      alert('Lỗi tải file: ' + (error?.message || 'Không tìm thấy file'))
    }
  }

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <h1 className="page-title">Kho Tài Liệu Chung</h1>
        <p className="page-description">Khám phá và tải xuống các tài liệu học tập chuẩn theo chương trình.</p>
      </div>

      {/* Thanh Tìm kiếm và Lọc - luôn hiện */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Tìm kiếm tài liệu theo tên..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ marginBottom: 0 }}
          />
        </div>
        <div style={{ flex: '0 1 200px' }}>
          <select className="form-select" value={filterCategory} onChange={handleFilterCategoryChange} style={{ marginBottom: 0 }}>
            <option value="All">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '0 1 200px' }}>
          <select className="form-select" value={filterFormat} onChange={handleFilterFormatChange} style={{ marginBottom: 0 }}>
            <option value="All">Tất cả định dạng</option>
            <option value="word">Word</option>
            <option value="pdf">PDF</option>
            <option value="powerpoint">PowerPoint</option>
            <option value="video">Video</option>
          </select>
        </div>
      </div>

      {/* Nội dung */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Đang tải tài liệu...</p>
        </div>
      ) : errorMsg ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'red' }}>
          <p>Lỗi: {errorMsg}</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem auto' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Hiện tại Admin chưa tải lên tài liệu nào</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Bạn hãy đợi nhé! Admin sẽ cập nhật tài liệu mới sớm thôi.
          </p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <h3>Không tìm thấy tài liệu nào phù hợp với bộ lọc.</h3>
        </div>
      ) : (
        <>
          <div className="card-grid">
            {currentDocs.map((doc) => (
              <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ background: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600' }}>
                      {doc.categories?.name || 'Chưa phân loại'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>
                      {doc.file_format?.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="card-title">{doc.title}</h3>
                  <p className="card-text">{doc.description || 'Tài liệu chất lượng cao đã được biên soạn và kiểm duyệt.'}</p>
                </div>
                <div style={{ marginTop: '2rem' }}>
                  {previewSupportedFormats.includes(doc.file_format?.toLowerCase()) ? (
                    <Link href={`/kho-tai-lieu/${doc.id}`} className="btn btn-outline" style={{ width: '100%', display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
                      Xem chi tiết
                    </Link>
                  ) : (
                    <button className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => handleDownload(doc.file_path, doc.title, doc.file_format)}>
                      ⬇️ Tải xuống
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem' }}>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="btn btn-outline" style={{ padding: '0.5rem 1rem', opacity: currentPage === 1 ? 0.5 : 1 }}>
                Trước
              </button>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => handlePageChange(page)} className={currentPage === page ? "btn btn-primary" : "btn btn-outline"} style={{ padding: '0.5rem 1rem', minWidth: '40px' }}>
                    {page}
                  </button>
                ))}
              </div>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="btn btn-outline" style={{ padding: '0.5rem 1rem', opacity: currentPage === totalPages ? 0.5 : 1 }}>
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
