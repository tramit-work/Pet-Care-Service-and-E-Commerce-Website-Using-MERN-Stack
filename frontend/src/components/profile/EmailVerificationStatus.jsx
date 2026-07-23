import { useState } from 'react';
import DevVerificationLinkNotice from '../auth/DevVerificationLinkNotice';
import { useAuth } from '../../context/AuthContext';

function EmailVerificationStatus({ user, onSuccess }) {
  const { resendVerification } = useAuth();
  const [resendState, setResendState] = useState('idle'); // idle | sending | sent
  const [devVerificationUrl, setDevVerificationUrl] = useState(null);
  const [error, setError] = useState(null);

  async function handleResend() {
    setResendState('sending');
    setError(null);
    try {
      const data = await resendVerification(user.email);
      setResendState('sent');
      setDevVerificationUrl(data.developmentMode ? data.verificationUrl : null);
      onSuccess?.(data.message);
    } catch (err) {
      setResendState('idle');
      setError(err.response?.data?.message || 'Không gửi lại được email xác thực.');
    }
  }

  return (
    <div className="profile-verify-status">
      <span className={`profile-status-badge${user?.isVerified ? ' verified' : ' unverified'}`}>
        {user?.isVerified ? 'Email đã xác thực' : 'Email chưa xác thực'}
      </span>

      {!user?.isVerified && (
        <div className="profile-verify-actions">
          {resendState === 'sent' ? (
            <p className="profile-form-label">Đã gửi lại email xác thực.</p>
          ) : (
            <button type="button" className="auth-resend-btn" onClick={handleResend} disabled={resendState === 'sending'}>
              {resendState === 'sending' ? 'Đang gửi...' : 'Gửi lại Email xác thực'}
            </button>
          )}
          {error && <p className="auth-error">{error}</p>}
          <DevVerificationLinkNotice verificationUrl={devVerificationUrl} />
        </div>
      )}
    </div>
  );
}

export default EmailVerificationStatus;
