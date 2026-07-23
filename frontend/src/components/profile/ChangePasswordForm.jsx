import { useState } from 'react';
import { changePassword } from '../../api/accountService';

const MIN_LENGTH = 6;

function ChangePasswordForm({ hasPassword, onCancel, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (hasPassword && !currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < MIN_LENGTH) {
      setError(`Mật khẩu mới phải có ít nhất ${MIN_LENGTH} ký tự.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setSubmitting(true);
    try {
      const message = await changePassword(hasPassword ? currentPassword : undefined, newPassword);
      onSuccess?.(message);
      onCancel();
    } catch (err) {
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="profile-inline-form">
      {error && <p className="auth-error">{error}</p>}
      {!hasPassword && (
        <p className="auth-status-message" style={{ margin: 0 }}>
          Tài khoản của bạn đăng nhập bằng Google, chưa có mật khẩu — đặt mật khẩu bên dưới để có thể đăng nhập bằng email/mật khẩu sau này.
        </p>
      )}

      {hasPassword && (
        <div>
          <label className="profile-form-label">Mật khẩu hiện tại</label>
          <input
            className="form-input"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
      )}
      <div>
        <label className="profile-form-label">Mật khẩu mới</label>
        <input className="form-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>
      <div>
        <label className="profile-form-label">Xác nhận mật khẩu mới</label>
        <input
          className="form-input"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <div className="profile-inline-form-actions">
        <button type="button" className="profile-btn-secondary" onClick={onCancel} disabled={submitting}>
          Hủy
        </button>
        <button type="submit" className="profile-btn-primary" disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
        </button>
      </div>
    </form>
  );
}

export default ChangePasswordForm;
