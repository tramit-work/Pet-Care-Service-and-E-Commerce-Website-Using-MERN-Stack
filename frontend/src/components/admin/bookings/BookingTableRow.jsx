import DropdownActionMenu from '../DropdownActionMenu';
import { BOOKING_STATUS_LABELS } from '../../../utils/adminConstants';
import { formatDate } from '../../../utils/formatDate';

function BookingTableRow({ stt, code, booking, onTransition, onViewDetail, onEdit, onDelete }) {
  const actions = [{ label: 'Xem chi tiết', icon: 'bx-show', onClick: onViewDetail }];

  if (booking.status === 'pending') {
    actions.push({ label: 'Xác nhận đơn', icon: 'bx-check', onClick: () => onTransition('confirmed', 'Xác nhận đơn', 'info') });
    actions.push({ label: 'Hủy đơn', icon: 'bx-x', danger: true, onClick: () => onTransition('cancelled', 'Hủy đơn', 'danger') });
  } else if (booking.status === 'confirmed') {
    actions.push({
      label: 'Hoàn thành đơn',
      icon: 'bx-check-double',
      onClick: () => onTransition('completed', 'Hoàn thành đơn', 'info'),
    });
    actions.push({ label: 'Hủy đơn', icon: 'bx-x', danger: true, onClick: () => onTransition('cancelled', 'Hủy đơn', 'danger') });
  }
  actions.push({ label: 'Sửa thông tin', icon: 'bx-edit', onClick: onEdit });
  actions.push({ label: 'Xóa', icon: 'bx-trash', danger: true, onClick: onDelete });

  return (
    <tr>
      <td>{stt}</td>
      <td>
        <span className="admin-booking-code">{code}</span>
      </td>
      <td>{booking.customerName}</td>
      <td>{booking.phone}</td>
      <td>{booking.serviceType}</td>
      <td>{formatDate(booking.bookingDate)}</td>
      <td>{booking.bookingTime || '—'}</td>
      <td>
        <span className={`order-status-badge status-${booking.status}`}>
          {BOOKING_STATUS_LABELS[booking.status] || booking.status}
        </span>
      </td>
      <td className="admin-table-actions-cell">
        <DropdownActionMenu items={actions} />
      </td>
    </tr>
  );
}

export default BookingTableRow;
