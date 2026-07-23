import Modal from '../Modal';
import { formatDate } from '../../../utils/formatDate';
import { BOOKING_STATUS_LABELS } from '../../../utils/adminConstants';

function BookingDetailModal({ booking, stt, code, onClose }) {
  return (
    <Modal title="Chi tiết đặt lịch" onClose={onClose} size="md">
      <div className="admin-detail-grid">
        <div className="admin-detail-item">
          <div className="admin-detail-label">Mã Booking</div>
          <div className="admin-detail-value">
            <span className="admin-booking-code">{code}</span>
          </div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">STT</div>
          <div className="admin-detail-value">{stt}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Tên khách hàng</div>
          <div className="admin-detail-value">{booking.customerName}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Số điện thoại</div>
          <div className="admin-detail-value">{booking.phone}</div>
        </div>
        <div className="admin-detail-item full">
          <div className="admin-detail-label">Email</div>
          <div className="admin-detail-value">{booking.email || '—'}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Dịch vụ</div>
          <div className="admin-detail-value">{booking.serviceType}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Trạng thái</div>
          <div className="admin-detail-value">
            <span className={`order-status-badge status-${booking.status}`}>
              {BOOKING_STATUS_LABELS[booking.status] || booking.status}
            </span>
          </div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Ngày đặt</div>
          <div className="admin-detail-value">{formatDate(booking.bookingDate)}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Giờ đặt</div>
          <div className="admin-detail-value">{booking.bookingTime || '—'}</div>
        </div>
        <div className="admin-detail-item full">
          <div className="admin-detail-label">Ghi chú</div>
          <div className="admin-detail-value">{booking.note || '—'}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Ngày tạo</div>
          <div className="admin-detail-value">{formatDate(booking.createdAt)}</div>
        </div>

        {Array.isArray(booking.statusHistory) && booking.statusHistory.length > 0 && (
          <div className="admin-detail-item full">
            <div className="admin-detail-label">Lịch sử trạng thái</div>
            <ul className="admin-detail-history">
              {booking.statusHistory.map((h, i) => (
                <li key={i}>
                  {BOOKING_STATUS_LABELS[h.status] || h.status} — {formatDate(h.updatedAt)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default BookingDetailModal;
