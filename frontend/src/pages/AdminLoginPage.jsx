import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const EMPTY_FORM = { email: '', password: '' };
const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;


function AdminLoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function validate() {
    const nextErrors = {};

    if (!values.email.trim()) {
      nextErrors.email = 'Vui lòng nhập email.';
    } else if (!EMAIL_REGEX.test(values.email.trim().toLowerCase())) {
      nextErrors.email = 'Email không đúng định dạng.';
    }

    if (!values.password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGeneralError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(values.email.trim().toLowerCase(), values.password);
      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    } catch (err) {
      if (err.details?.length) {
        const fieldErrors = {};
        err.details.forEach((detail) => {
          fieldErrors[detail.field] = detail.message;
        });
        setErrors(fieldErrors);
      } else {
        // 401 sai mật khẩu, 403 khóa tài khoản / không có quyền quản trị...
        setGeneralError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <span className="admin-login-logo">Cuc Pet</span>
          <span className="admin-login-badge">Quản trị</span>
        </div>

        <h1>Đăng nhập quản trị</h1>
        <p className="admin-login-subtitle">Dành cho Quản trị viên và Biên tập viên.</p>

        <form onSubmit={handleSubmit} noValidate className="admin-login-form">
          {generalError && <p className="admin-login-error">{generalError}</p>}

          <div className="admin-login-field">
            <label htmlFor="admin-login-email">Email</label>
            <input
              id="admin-login-email"
              type="email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="admin@cucpet.vn"
              disabled={submitting}
            />
            {errors.email && <p className="admin-login-error">{errors.email}</p>}
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-login-password">Mật khẩu</label>
            <input
              id="admin-login-password"
              type="password"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              disabled={submitting}
            />
            {errors.password && <p className="admin-login-error">{errors.password}</p>}
          </div>

          <button type="submit" className="admin-login-submit" disabled={submitting}>
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
