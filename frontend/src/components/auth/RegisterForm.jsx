function RegisterForm({ values, errors, generalError, submitting, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} noValidate className="auth-form-fields">
      {generalError && <p className="auth-error">{generalError}</p>}

      <div>
        <input
          className="form-input"
          type="text"
          placeholder="Họ tên của bạn"
          value={values.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
        {errors.name && <p className="auth-error">{errors.name}</p>}
      </div>

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
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          value={values.password}
          onChange={(e) => onChange('password', e.target.value)}
        />
        {errors.password && <p className="auth-error">{errors.password}</p>}
      </div>

      <div>
        <input
          className="form-input"
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={values.confirmPassword}
          onChange={(e) => onChange('confirmPassword', e.target.value)}
        />
        {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword}</p>}
      </div>

      <button className="button-submit" type="submit" disabled={submitting}>
        {submitting ? 'Đang đăng ký...' : 'Đăng ký'}
      </button>
    </form>
  );
}

export default RegisterForm;
