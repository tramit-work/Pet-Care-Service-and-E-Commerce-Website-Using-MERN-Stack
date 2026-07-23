import { useState } from 'react';
import Modal from '../Modal';
import { SERVICE_TYPES } from '../../../utils/adminConstants';

function BookingFormModal({ initialData, onClose, onSubmit }) {
  const [form, setForm] = useState({
    customerName: initialData.customerName || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    serviceType: initialData.serviceType || SERVICE_TYPES[0],
    bookingDate: initialData.bookingDate ? initialData.bookingDate.slice(0, 10) : '',
    bookingTime: initialData.bookingTime || '',
    note: initialData.note || '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.customerName.trim()) nextErrors.customerName = 'Họ tên là bắt buộc';
    if (!form.phone.trim()) nextErrors.phone = 'Số điện thoại là bắt buộc';
    if (!form.bookingDate) nextErrors.bookingDate = 'Ngày đặt lịch là bắt buộc';
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
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        serviceType: form.serviceType,
        bookingDate: form.bookingDate,
        bookingTime: form.bookingTime.trim(),
        note: form.note.trim(),
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
      title="Sửa đặt lịch"
      onClose={onClose}
      loading={submitting}
      footer={
        <>
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button type="submit" form="booking-form" className="admin-btn admin-btn-primary" disabled={submitting}>
            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </>
      }
    >
      <form id="booking-form" onSubmit={handleSubmit} className="admin-form-grid">
        {serverError && (
          <div className="admin-form-group full">
            <span className="admin-form-error">{serverError}</span>
          </div>
        )}

        <div className="admin-form-group">
          <label className="admin-form-label">
            Họ tên khách<span className="required">*</span>
          </label>
          <input
            type="text"
            className={`admin-form-input${errors.customerName ? ' has-error' : ''}`}
            value={form.customerName}
            onChange={(e) => updateField('customerName', e.target.value)}
          />
          {errors.customerName && <span className="admin-form-error">{errors.customerName}</span>}
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            Số điện thoại<span className="required">*</span>
          </label>
          <input
            type="text"
            className={`admin-form-input${errors.phone ? ' has-error' : ''}`}
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
          {errors.phone && <span className="admin-form-error">{errors.phone}</span>}
        </div>

        <div className="admin-form-group full">
          <label className="admin-form-label">Email</label>
          <input type="email" className="admin-form-input" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
        </div>

        <div className="admin-form-group full">
          <label className="admin-form-label">Loại dịch vụ</label>
          <select className="admin-form-select" value={form.serviceType} onChange={(e) => updateField('serviceType', e.target.value)}>
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            Ngày đặt lịch<span className="required">*</span>
          </label>
          <input
            type="date"
            className={`admin-form-input${errors.bookingDate ? ' has-error' : ''}`}
            value={form.bookingDate}
            onChange={(e) => updateField('bookingDate', e.target.value)}
          />
          {errors.bookingDate && <span className="admin-form-error">{errors.bookingDate}</span>}
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Giờ đặt lịch</label>
          <input type="text" className="admin-form-input" placeholder="VD: 14:30" value={form.bookingTime} onChange={(e) => updateField('bookingTime', e.target.value)} />
        </div>

        <div className="admin-form-group full">
          <label className="admin-form-label">Ghi chú</label>
          <textarea className="admin-form-textarea" value={form.note} onChange={(e) => updateField('note', e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}

export default BookingFormModal;
