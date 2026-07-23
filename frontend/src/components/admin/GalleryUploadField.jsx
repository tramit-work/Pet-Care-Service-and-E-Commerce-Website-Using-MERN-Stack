import { useRef, useState } from 'react';
import { uploadImages } from '../../api/adminUploadService';
import { useAdminToast } from '../../context/AdminToastContext';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGES = 10;

function GalleryUploadField({ label = 'Thư viện ảnh (nhiều ảnh)', value = [], onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { showToast } = useAdminToast();

  function openPicker() {
    if (uploading || value.length >= MAX_IMAGES) return;
    inputRef.current?.click();
  }

  async function handleFilesChange(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    const invalid = files.find((f) => !ALLOWED_TYPES.includes(f.type));
    if (invalid) {
      setLocalError('Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WEBP');
      return;
    }

    const remainingSlots = MAX_IMAGES - value.length;
    if (files.length > remainingSlots) {
      setLocalError(`Chỉ còn có thể thêm tối đa ${remainingSlots} ảnh (giới hạn ${MAX_IMAGES} ảnh)`);
      return;
    }

    setLocalError(null);
    setUploading(true);
    try {
      const urls = await uploadImages(files);
      onChange([...value, ...urls]);
      showToast(`Upload ${urls.length} ảnh thành công.`);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Upload ảnh thất bại, vui lòng thử lại');
    } finally {
      setUploading(false);
    }
  }

  function handleRemove(index) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="admin-form-group full admin-image-field">
      <label className="admin-form-label">
        {label} ({value.length}/{MAX_IMAGES})
      </label>

      <div className="admin-gallery-list">
        {value.map((url, index) => (
          <div className="admin-gallery-item" key={`${url}-${index}`}>
            <img src={url} alt={`Ảnh ${index + 1}`} />
            <button
              type="button"
              className="admin-gallery-remove"
              onClick={() => handleRemove(index)}
              aria-label="Gỡ ảnh"
            >
              ×
            </button>
          </div>
        ))}

        {value.length < MAX_IMAGES && (
          <div className="admin-upload-trigger-wrap">
            <div className="admin-gallery-add-tile" onClick={openPicker} role="button" tabIndex={0}>
              <i className="bx bx-plus"></i>
              {uploading && (
                <div className="admin-upload-overlay">
                  <i className="bx bx-loader-alt bx-spin"></i>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={handleFilesChange}
      />

      {localError && <span className="admin-form-error admin-image-hint-error">{localError}</span>}
      <span className="admin-form-hint">Có thể chọn nhiều ảnh cùng lúc — tối đa {MAX_IMAGES} ảnh.</span>
    </div>
  );
}

export default GalleryUploadField;
