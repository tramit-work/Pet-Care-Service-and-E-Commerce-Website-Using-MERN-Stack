import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthCard from '../components/auth/AuthCard';
import { useAuth } from '../context/AuthContext';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); 
  const [message, setMessage] = useState('');
  const [errorCode, setErrorCode] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Thiếu token xác thực trong đường dẫn.');
      return;
    }

    let cancelled = false;
    verifyEmail(token)
      .then((successMessage) => {
        if (!cancelled) {
          setStatus('success');
          setMessage(successMessage);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus('error');
          setMessage(err.response?.data?.message || 'Xác thực email thất bại.');
          setErrorCode(err.response?.data?.details?.code || null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthCard title="Xác thực Email" footerText="" footerLinkText="Về trang Đăng nhập" footerLinkTo="/login">
      <div className="auth-status-block">
        {status === 'loading' && (
          <>
            <i className="bx bx-loader-alt bx-spin auth-status-icon"></i>
            <p className="auth-status-message">Đang xác thực email của bạn...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <i className="bx bx-check-circle auth-status-icon success"></i>
            <p className="auth-status-message">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <i className="bx bx-x-circle auth-status-icon error"></i>
            <p className="auth-status-message">{message}</p>
            {errorCode === 'TOKEN_EXPIRED' && (
              <Link to="/login" className="auth-resend-btn">
                Đăng nhập để gửi lại email xác thực
              </Link>
            )}
          </>
        )}
      </div>
    </AuthCard>
  );
}

export default VerifyEmailPage;
