import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <section className="hero">
        <h1 className="hero-title">Trung Tâm Tài Liệu Giáo Dục</h1>
        <p className="hero-subtitle">
          Nền tảng chia sẻ và yêu cầu tài liệu giảng dạy, học tập chuyên biệt dành cho giáo viên và học sinh. Nhanh chóng, chính xác và bảo mật.
        </p>
        <div className="hero-actions">
          <Link href="/kho-tai-lieu" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
            Khám phá kho tài liệu
          </Link>
          <Link href="/yeu-cau" className="btn btn-outline" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
            Gửi yêu cầu riêng
          </Link>
        </div>
      </section>

      <section className="card-grid">
        <div className="card">
          <h3 className="card-title">📚 Kho Tài Liệu Khổng Lồ</h3>
          <p className="card-text">
            Truy cập các tài liệu học tập theo chủ đề, bao gồm Thực vật, Động vật, Chăm sóc cây trồng, và nhiều hơn nữa. Tải xuống dễ dàng và miễn phí.
          </p>
        </div>
        <div className="card">
          <h3 className="card-title">🎯 Yêu Cầu Theo Nhu Cầu</h3>
          <p className="card-text">
            Bạn cần tài liệu chuyên biệt? Đặt yêu cầu ngay với Admin để nhận được tài liệu riêng tư (Word, PDF, Video) được chuẩn bị kỹ lưỡng.
          </p>
        </div>
        <div className="card">
          <h3 className="card-title">💬 Trao Đổi & Hỗ Trợ</h3>
          <p className="card-text">
            Hệ thống chat real-time cho phép bạn trao đổi trực tiếp với Admin về các yêu cầu tài liệu, cũng như thảo luận công khai cùng mọi người.
          </p>
        </div>
      </section>
    </div>
  )
}
