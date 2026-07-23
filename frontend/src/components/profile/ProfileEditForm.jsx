import { useState } from 'react';
import { updateProfile } from '../../api/accountService';

function ProfileEditForm({ user, onUpdated, onCancel, onSuccess }) {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Họ tên không được để trống.');
      return;
    }

    setSubmitting(true);
    try {
      const updatedUser = await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      onUpdated(updatedUser);
      onSuccess?.('Cập nhật thông tin thành công.');
      onCancel();
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="profile-inline-form">
      {error && <p className="auth-error">{error}</p>}

      <div>
        <label className="profile-form-label">Họ tên</label>
        <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div>
        <label className="profile-form-label">Số điện thoại</label>
        <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <label className="profile-form-label">Địa chỉ</label>
        <input className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div className="profile-inline-form-actions">
        <button type="button" className="profile-btn-secondary" onClick={onCancel} disabled={submitting}>
          Hủy
        </button>
        <button type="submit" className="profile-btn-primary" disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
}

export default ProfileEditForm;
