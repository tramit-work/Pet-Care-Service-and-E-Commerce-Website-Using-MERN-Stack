import DatePicker, { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('vi', vi);

function BookingForm({
  visible,
  isShowing,
  serviceName,
  formData,
  errors = {},
  submitting = false,
  onFieldChange,
  onSubmit,
  onClose,
}) {
  return (
    <div className={`modal-shopping${isShowing ? ' show' : ''}`} style={{ display: visible ? 'flex' : 'none' }}>
      {visible && (
        <div className="booking-modal-content">
          <div className="booking-modal-header">
            <div className="booking-modal-header-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="16" rx="3" />
                <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
                <path d="M8.5 14.5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>Đặt lịch {serviceName}</h4>
            <p className="booking-modal-subtitle">
              Điền thông tin bên dưới, chúng tôi sẽ liên hệ xác nhận sớm nhất.
            </p>
          </div>

          <div className="booking-field">
            <label htmlFor="booking-name" className="booking-field-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
              </svg>
              Họ tên
            </label>
            <input
              id="booking-name"
              type="text"
              className={`booking-input${errors.name ? ' has-error' : ''}`}
              placeholder="Nhập họ tên"
              value={formData.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              disabled={submitting}
            />
            {errors.name && <p className="booking-error">{errors.name}</p>}
          </div>

          <div className="booking-field">
            <label htmlFor="booking-phone" className="booking-field-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Số điện thoại
            </label>
            <input
              id="booking-phone"
              type="tel"
              className={`booking-input${errors.phone ? ' has-error' : ''}`}
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              disabled={submitting}
            />
            {errors.phone && <p className="booking-error">{errors.phone}</p>}
          </div>

          <div className="booking-field">
            <label htmlFor="booking-date" className="booking-field-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="3" />
                <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
              </svg>
              Ngày đặt
            </label>
            <DatePicker
              id="booking-date"
              selected={formData.date ? new Date(`${formData.date}T00:00:00`) : null}
              onChange={(date) => {
                if (!date) return onFieldChange('date', '');
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                onFieldChange('date', `${y}-${m}-${d}`);
              }}
              dateFormat="dd/MM/yyyy"
              locale="vi"
              minDate={new Date()}
              placeholderText="Chọn ngày đặt lịch"
              className={`booking-input${errors.date ? ' has-error' : ''}`}
              wrapperClassName="booking-datepicker-wrapper"
              popperClassName="booking-datepicker-popper"
              calendarClassName="booking-datepicker-calendar"
              disabled={submitting}
              autoComplete="off"
            />
            {errors.date && <p className="booking-error">{errors.date}</p>}
          </div>

          <div className="booking-modal-actions">
            <button type="button" className="booking-btn-submit" onClick={onSubmit} disabled={submitting}>
              {submitting && <span className="booking-spinner" aria-hidden="true"></span>}
              {submitting ? 'Đang gửi...' : 'Xác nhận đặt lịch'}
            </button>
            <button type="button" className="booking-btn-cancel" onClick={onClose} disabled={submitting}>
              Huỷ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingForm;
