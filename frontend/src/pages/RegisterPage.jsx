import { useState } from 'react';
import AuthCard from '../components/auth/AuthCard';
import RegisterForm from '../components/auth/RegisterForm';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import DevVerificationLinkNotice from '../components/auth/DevVerificationLinkNotice';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '' };
const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const MIN_PASSWORD_LENGTH = 6;

function RegisterPage() {
  const { register } = useAuth();

  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [devVerificationUrl, setDevVerificationUrl] = useState(null);

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = 'Vui lòng nhập họ tên.';
    }

    if (!values.email.trim()) {
      nextErrors.email = 'Vui lòng nhập email.';
    } else if (!EMAIL_REGEX.test(values.email.trim().toLowerCase())) {
      nextErrors.email = 'Email không đúng định dạng.';
    }

    if (!values.password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.';
    } else if (values.password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu.';
    } else if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = 'Mật khẩu nhập lại không khớp.';
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
      const data = await register({
        fullName: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      setSuccessMessage(data.message);
      setDevVerificationUrl(data.developmentMode ? data.verificationUrl : null);
    } catch (err) {
      if (err.details?.length) {
        const fieldErrors = {};
        err.details.forEach((detail) => {
          fieldErrors[detail.field === 'fullName' ? 'name' : detail.field] = detail.message;
        });
        setErrors(fieldErrors);
      } else {
        setGeneralError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <AuthCard title="Kiểm tra email của bạn" footerText="Đã xác thực rồi?" footerLinkText="Đăng nhập" footerLinkTo="/login">
        <p className="auth-success-message">{successMessage}</p>
        <DevVerificationLinkNotice verificationUrl={devVerificationUrl} />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Đăng ký"
      footerText="Đã có tài khoản?"
      footerLinkText="Đăng nhập"
      footerLinkTo="/login"
    >
      <RegisterForm
        values={values}
        errors={errors}
        generalError={generalError}
        submitting={submitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
      <div className="auth-divider">Hoặc</div>
      <GoogleLoginButton onError={setGeneralError} />
    </AuthCard>
  );
}

export default RegisterPage;
