import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthCard from '../components/auth/AuthCard';
import { useAuth } from '../context/AuthContext';

const MIN_PASSWORD_LENGTH = 6;

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  function validate() {
    const nextErrors = {};
    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu mới.';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu.';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Mật khẩu nhập lại không khớp.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGeneralError(null);
    if (!token) {
      setGeneralError('Thiếu token đặt lại mật khẩu trong đường dẫn.');
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const message = await resetPassword(token, password, confirmPassword);
      setSuccessMessage(message);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthCard title="Đặt lại mật khẩu" footerText="" footerLinkText="Yêu cầu liên kết mới" footerLinkTo="/forgot-password">
        <p className="auth-error">Liên kết không hợp lệ — thiếu token trong đường dẫn.</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Đặt lại mật khẩu" footerText="" footerLinkText="Về trang Đăng nhập" footerLinkTo="/login">
      {successMessage ? (
        <p className="auth-success-message">{successMessage}</p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="auth-form-fields">
          {generalError && (
            <div>
              <p className="auth-error">{generalError}</p>
              <Link to="/forgot-password" className="auth-resend-btn">
                Yêu cầu liên kết mới
              </Link>
            </div>
          )}

          <div>
            <input
              className="form-input"
              type="password"
              placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="auth-error">{errors.password}</p>}
          </div>

          <div>
            <input
              className="form-input"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword}</p>}
          </div>

          <button className="button-submit" type="submit" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      )}
    </AuthCard>
  );
}

export default ResetPasswordPage;
