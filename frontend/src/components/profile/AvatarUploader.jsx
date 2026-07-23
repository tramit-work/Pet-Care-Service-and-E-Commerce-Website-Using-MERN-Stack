import { useRef, useState } from 'react';
import { uploadAvatar, updateProfile } from '../../api/accountService';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function AvatarUploader({ user, onUpdated, onError, onSuccess }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || '?';

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      onError?.('Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WEBP.');
      return;
    }

    setUploading(true);
    try {
      const avatarUrl = await uploadAvatar(file);
      const updatedUser = await updateProfile({ avatar: avatarUrl });
      onUpdated(updatedUser);
      onSuccess?.('Cập nhật ảnh đại diện thành công.');
    } catch (err) {
      onError?.(err.response?.data?.message || 'Đổi ảnh đại diện thất bại.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="profile-avatar profile-avatar-clickable"
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      title="Bấm để đổi ảnh đại diện"
    >
      {user?.avatar ? <img src={user.avatar} alt={user.fullName} /> : initial}
      <span className="profile-avatar-edit-badge">
        <i className={`bx ${uploading ? 'bx-loader-alt bx-spin' : 'bx-camera'}`}></i>
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default AvatarUploader;
