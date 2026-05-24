import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '8rem 0' }}>
      <h1 className="hero-title" style={{ fontSize: '8rem', color: 'var(--primary)', marginBottom: '0' }}>404</h1>
      <h2 className="page-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Không Tìm Thấy Trang</h2>
      <p className="page-description" style={{ marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
        Xin lỗi, trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không thể truy cập.
      </p>
      <Link href="/" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}>
        Quay Về Trang Chủ
      </Link>
    </div>
  )
}
