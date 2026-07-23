import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../components/auth/AuthCard';
import LoginForm from '../components/auth/LoginForm';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { email: '', password: '' };
const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

function LoginPage() {
  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notVerifiedEmail, setNotVerifiedEmail] = useState(null);
  const [resendState, setResendState] = useState('idle'); 
  const [devVerificationUrl, setDevVerificationUrl] = useState(null);

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
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
    setNotVerifiedEmail(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(values.email.trim().toLowerCase(), values.password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      if (err.details?.length) {
        const fieldErrors = {};
        err.details.forEach((detail) => {
          fieldErrors[detail.field] = detail.message;
        });
        setErrors(fieldErrors);
      } else if (err.details?.code === 'EMAIL_NOT_VERIFIED') {
        setNotVerifiedEmail(values.email.trim().toLowerCase());
        setGeneralError(err.message);
      } else {
        setGeneralError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!notVerifiedEmail) return;
    setResendState('sending');
    try {
      const data = await resendVerification(notVerifiedEmail);
      setResendState('sent');
      setDevVerificationUrl(data.developmentMode ? data.verificationUrl : null);
    } catch (err) {
      setResendState('idle');
      setGeneralError(err.response?.data?.message || 'Không gửi lại được email xác thực.');
    }
  }

  return (
    <AuthCard
      title="Đăng nhập"
      footerText="Chưa có tài khoản?"
      footerLinkText="Đăng ký ngay"
      footerLinkTo="/register"
    >
      <LoginForm
        values={values}
        errors={errors}
        generalError={generalError}
        submitting={submitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
        notVerifiedEmail={notVerifiedEmail}
        resendState={resendState}
        onResend={handleResend}
        devVerificationUrl={devVerificationUrl}
      />
      <div className="auth-divider">Hoặc</div>
      <GoogleLoginButton onError={setGeneralError} />
    </AuthCard>
  );
}

export default LoginPage;
