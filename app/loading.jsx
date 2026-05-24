export default function Loading() {
  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner"></div>
        <p className="page-description" style={{ marginTop: '1.5rem', fontWeight: '500' }}>
          Đang tải dữ liệu...
        </p>
      </div>
      
      {/* CSS in JS dành riêng cho hiệu ứng Loading */}
      <style>{`
        .spinner {
          width: 60px;
          height: 60px;
          border: 6px solid rgba(59, 130, 246, 0.15);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
