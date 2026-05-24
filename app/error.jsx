'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Có thể kết nối với dịch vụ ghi log lỗi tại đây
    console.error(error)
  }, [error])

  return (
    <div className="container" style={{ textAlign: 'center', padding: '8rem 0' }}>
      <h1 className="hero-title" style={{ fontSize: '5rem', color: '#ef4444', marginBottom: '1rem' }}>Oops!</h1>
      <h2 className="page-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Đã Xảy Ra Lỗi Hệ Thống</h2>
      <p className="page-description" style={{ marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
        Chúng tôi rất tiếc vì sự cố ngoài ý muốn này. Bạn có thể thử tải lại trang hoặc quay về trang chủ.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          className="btn btn-primary"
          style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}
        >
          Thử Lại Ngay
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="btn btn-outline"
          style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}
        >
          Về Trang Chủ
        </button>
      </div>
    </div>
  )
}
