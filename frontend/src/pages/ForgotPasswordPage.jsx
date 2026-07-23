import { useState } from 'react';
import AuthCard from '../components/auth/AuthCard';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      setError('Email không đúng định dạng.');
      return;
    }

    setSubmitting(true);
    try {
      const message = await forgotPassword(email.trim().toLowerCase());
      setSuccessMessage(message);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Quên mật khẩu" footerText="Đã nhớ mật khẩu?" footerLinkText="Đăng nhập" footerLinkTo="/login">
      {successMessage ? (
        <p className="auth-success-message">{successMessage}</p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="auth-form-fields">
          <p className="auth-status-message" style={{ margin: 0 }}>
            Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
          </p>
          {error && <p className="auth-error">{error}</p>}
          <div>
            <input
              className="form-input"
              type="email"
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button className="button-submit" type="submit" disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
          </button>
        </form>
      )}
    </AuthCard>
  );
}

export default ForgotPasswordPage;
