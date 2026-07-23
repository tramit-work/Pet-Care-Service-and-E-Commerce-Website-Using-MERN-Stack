import { Link } from 'react-router-dom';
import DevVerificationLinkNotice from './DevVerificationLinkNotice';

function LoginForm({
  values,
  errors,
  generalError,
  submitting,
  onChange,
  onSubmit,
  notVerifiedEmail,
  resendState,
  onResend,
  devVerificationUrl,
}) {
  return (
    <form onSubmit={onSubmit} noValidate className="auth-form-fields">
      {generalError && <p className="auth-error">{generalError}</p>}

      {notVerifiedEmail && (
        <div className="auth-resend-box">
          {resendState === 'sent' ? (
            <p>Đã gửi lại email xác thực tới {notVerifiedEmail}. Vui lòng kiểm tra hộp thư.</p>
          ) : (
            <>
              <p>Tài khoản này chưa xác thực email.</p>
              <button type="button" className="auth-resend-btn" onClick={onResend} disabled={resendState === 'sending'}>
                {resendState === 'sending' ? 'Đang gửi...' : 'Gửi lại email xác thực'}
              </button>
            </>
          )}
        </div>
      )}

      {resendState === 'sent' && <DevVerificationLinkNotice verificationUrl={devVerificationUrl} />}

      <div>
        <input
          className="form-input"
          type="email"
          placeholder="Email của bạn"
          value={values.email}
          onChange={(e) => onChange('email', e.target.value)}
        />
        {errors.email && <p className="auth-error">{errors.email}</p>}
      </div>

      <div>
        <input
          className="form-input"
          type="password"
          placeholder="Mật khẩu"
          value={values.password}
          onChange={(e) => onChange('password', e.target.value)}
        />
        {errors.password && <p className="auth-error">{errors.password}</p>}
      </div>

      <div className="auth-link-row">
        <Link to="/forgot-password">Quên mật khẩu?</Link>
      </div>

      <button className="button-submit" type="submit" disabled={submitting}>
        {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  );
}

export default LoginForm;
