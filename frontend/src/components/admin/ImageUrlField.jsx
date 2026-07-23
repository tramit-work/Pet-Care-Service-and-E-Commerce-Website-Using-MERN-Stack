function ImageUrlField({ label = 'Ảnh đại diện', value, onChange, error, required }) {
  return (
    <div className="admin-form-group full">
      <label className="admin-form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className="admin-image-input-row">
        <div className="admin-image-preview-single">
          {value ? <img src={value} alt="Xem trước" /> : <i className="bx bx-image"></i>}
        </div>
        <input
          type="text"
          className={`admin-form-input${error ? ' has-error' : ''}`}
          placeholder="Dán URL ảnh (VD: https://...)"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {error && <span className="admin-form-error">{error}</span>}
      <span className="admin-form-hint">Dán đường dẫn ảnh — ảnh xem trước sẽ tự cập nhật.</span>
    </div>
  );
}

export default ImageUrlField;
