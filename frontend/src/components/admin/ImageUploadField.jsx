import { useRef, useState } from 'react';
import { uploadImage } from '../../api/adminUploadService';
import { useAdminToast } from '../../context/AdminToastContext';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function ImageUploadField({ label = 'Ảnh đại diện', value, onChange, error, required }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { showToast } = useAdminToast();

  function openPicker() {
    if (uploading) return;
    inputRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại cùng 1 file lần sau nếu cần
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError('Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WEBP');
      return;
    }

    setLocalError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      showToast('Upload ảnh thành công.');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Upload ảnh thất bại, vui lòng thử lại');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-form-group full">
      <label className="admin-form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className="admin-image-input-row">
        <div
          className={`admin-image-preview-single clickable${error || localError ? ' has-error' : ''}`}
          onClick={openPicker}
          role="button"
          tabIndex={0}
        >
          {value ? <img src={value} alt="Xem trước" /> : <i className="bx bx-image-add"></i>}
          {uploading && (
            <div className="admin-upload-overlay">
              <i className="bx bx-loader-alt bx-spin"></i>
            </div>
          )}
        </div>
        <button type="button" className="admin-btn admin-btn-secondary" onClick={openPicker} disabled={uploading}>
          <i className="bx bx-upload"></i>
          {value ? 'Đổi ảnh' : 'Chọn ảnh'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      {(error || localError) && <span className="admin-form-error">{localError || error}</span>}
      <span className="admin-form-hint">Chấp nhận JPG, JPEG, PNG, WEBP — bấm vào ảnh hoặc nút để chọn/đổi ảnh.</span>
    </div>
  );
}

export default ImageUploadField;
