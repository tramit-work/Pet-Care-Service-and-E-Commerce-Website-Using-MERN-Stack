import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 20px',
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <h1 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, color: '#fb8c5a', fontSize: '3rem', marginBottom: '8px' }}>
        404
      </h1>
      <p style={{ color: '#4a4a4a', marginBottom: '24px' }}>
        Không tìm thấy trang bạn yêu cầu.
      </p>
      <Link
        to="/"
        style={{
          background: '#fb8c5a',
          color: '#fff',
          padding: '10px 24px',
          borderRadius: '8px',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Về trang chủ
      </Link>
    </div>
  );
}

export default NotFoundPage;
