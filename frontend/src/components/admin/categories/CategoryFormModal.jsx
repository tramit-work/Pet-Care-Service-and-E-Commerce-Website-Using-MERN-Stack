import { useState } from 'react';
import Modal from '../Modal';
import ImageUrlField from '../ImageUrlField';

const EMPTY_FORM = {
  name: '',
  description: '',
  image: '',
  icon: '',
  displayOrder: 0,
  isFeatured: false,
  status: 'active',
};

function CategoryFormModal({ initialData, onClose, onSubmit }) {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState(() =>
    initialData
      ? {
          name: initialData.name || '',
          description: initialData.description || '',
          image: initialData.image || '',
          icon: initialData.icon || '',
          displayOrder: initialData.displayOrder ?? 0,
          isFeatured: Boolean(initialData.isFeatured),
          status: initialData.status || 'active',
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Tên danh mục là bắt buộc';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        icon: form.icon.trim(),
        displayOrder: Number(form.displayOrder) || 0,
        isFeatured: form.isFeatured,
        status: form.status,
      });
    } catch (err) {
      const details = err.response?.data?.details;
      setServerError(
        Array.isArray(details) && details.length > 0
          ? details.map((d) => d.message).join('; ')
          : err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}
      onClose={onClose}
      loading={submitting}
      footer={
        <>
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button type="submit" form="category-form" className="admin-btn admin-btn-primary" disabled={submitting}>
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo danh mục'}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="admin-form-grid">
        {serverError && (
          <div className="admin-form-group full">
            <span className="admin-form-error">{serverError}</span>
          </div>
        )}

        <div className="admin-form-group full">
          <label className="admin-form-label">
            Tên danh mục<span className="required">*</span>
          </label>
          <input
            type="text"
            className={`admin-form-input${errors.name ? ' has-error' : ''}`}
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
          />
          {errors.name && <span className="admin-form-error">{errors.name}</span>}
        </div>

        <ImageUrlField value={form.image} onChange={(v) => updateField('image', v)} />

        <div className="admin-form-group full">
          <label className="admin-form-label">Mô tả</label>
          <textarea
            className="admin-form-textarea"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Icon (boxicons class)</label>
          <input
            type="text"
            className="admin-form-input"
            placeholder="VD: bx-dog"
            value={form.icon}
            onChange={(e) => updateField('icon', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Thứ tự hiển thị</label>
          <input
            type="number"
            className="admin-form-input"
            value={form.displayOrder}
            onChange={(e) => updateField('displayOrder', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Trạng thái</label>
          <select
            className="admin-form-select"
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>

        <div className="admin-form-group" style={{ justifyContent: 'flex-end' }}>
          <div className="admin-form-checkbox-row">
            <input
              type="checkbox"
              id="cat-featured"
              checked={form.isFeatured}
              onChange={(e) => updateField('isFeatured', e.target.checked)}
            />
            <label htmlFor="cat-featured">Danh mục nổi bật</label>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default CategoryFormModal;
