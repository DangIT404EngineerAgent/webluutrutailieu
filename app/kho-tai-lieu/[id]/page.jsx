'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ChiTietTaiLieu() {
  const supabase = createClient()
  const params = useParams()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    const fetchDocument = async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*, categories(name)')
        .eq('id', params.id)
        .single()

      if (data) {
        setDoc(data)

        // Lấy signed URL cho preview
        if (data.preview_file_path) {
          const { data: urlData } = await supabase.storage
            .from('documents')
            .createSignedUrl(data.preview_file_path, 3600)
          if (urlData?.signedUrl) setPreviewUrl(urlData.signedUrl)
        }
      }
      setLoading(false)
    }
    fetchDocument()
  }, [params.id])

  const handleDownload = async () => {
    if (!doc?.file_path) return

    let ext = ''
    const formatLower = doc.file_format?.toLowerCase() || ''
    if (formatLower === 'word') ext = '.docx'
    else if (formatLower === 'pdf') ext = '.pdf'
    else if (formatLower === 'powerpoint') ext = '.pptx'
    else if (formatLower === 'video') ext = '.mp4'

    const downloadName = doc.title.toLowerCase().endsWith(ext) ? doc.title : `${doc.title}${ext}`

    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.file_path, 300, {
        download: downloadName
      })

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    } else {
      alert('Lỗi tải file: ' + (error?.message || 'Không tìm thấy file'))
    }
  }

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}><p>Đang tải...</p></div>
  }

  if (!doc) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h2>Không tìm thấy tài liệu</h2>
        <Link href="/kho-tai-lieu" className="btn btn-primary" style={{ marginTop: '1rem' }}>Quay lại kho tài liệu</Link>
      </div>
    )
  }

  const isVideo = doc.file_format?.toLowerCase() === 'video'

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/kho-tai-lieu" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Quay lại
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Khung bên trái: Preview */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(248, 250, 252, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Xem trước tài liệu</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Bản xem trước ({isVideo ? 'Video' : 'PDF'})
            </span>
          </div>

          <div style={{ flex: 1, minHeight: '500px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isVideo && previewUrl ? (
              <video controls style={{ width: '100%', maxHeight: '600px' }} src={previewUrl}>
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
            ) : previewUrl ? (
              <iframe
                src={`${previewUrl}#toolbar=0`}
                style={{ width: '100%', height: '100%', minHeight: '600px', border: 'none' }}
                title={`Xem trước ${doc.title}`}
              ></iframe>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Không có bản xem trước cho tài liệu này.</p>
            )}
          </div>
        </div>

        {/* Khung bên phải: Thông tin */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ background: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                {doc.categories?.name || 'Chưa phân loại'}
              </span>
              <span style={{ background: 'var(--background)', color: 'var(--text-muted)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid var(--border)' }}>
                {doc.file_format?.toUpperCase()}
              </span>
            </div>

            <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', lineHeight: '1.3' }}>{doc.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {doc.description || 'Tài liệu chất lượng cao đã được biên soạn và kiểm duyệt.'}
            </p>

            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Định dạng gốc:</span>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{doc.file_format?.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ngày đăng:</span>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{new Date(doc.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <button onClick={handleDownload} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Tải file ({doc.file_format?.toUpperCase()})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
