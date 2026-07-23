import DropdownActionMenu from '../DropdownActionMenu';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, ORDER_STATUS_TRANSITIONS } from '../../../utils/adminConstants';

const TRANSITION_META = {
  confirmed: { label: 'Xác nhận đơn', icon: 'bx-check', tone: 'info' },
  shipping: { label: 'Bắt đầu giao hàng', icon: 'bx-package', tone: 'info' },
  completed: { label: 'Hoàn thành đơn', icon: 'bx-check-double', tone: 'info' },
  cancelled: { label: 'Hủy đơn', icon: 'bx-x', tone: 'danger' },
};

function OrderTableRow({ stt, order, onTransition, onViewDetail }) {
  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.orderStatus] || [];
  const actions = [{ label: 'Xem chi tiết', icon: 'bx-show', onClick: onViewDetail }];

  nextStatuses.forEach((next) => {
    const meta = TRANSITION_META[next];
    if (meta) {
      actions.push({
        label: meta.label,
        icon: meta.icon,
        danger: meta.tone === 'danger',
        onClick: () => onTransition(next, meta.label, meta.tone),
      });
    }
  });

  return (
    <tr>
      <td>{stt}</td>
      <td>
        <span className="admin-booking-code">{order.orderCode}</span>
      </td>
      <td>{order.receiverName}</td>
      <td>{order.user?.email || '—'}</td>
      <td>{order.phone}</td>
      <td>{formatPrice(order.finalAmount)}đ</td>
      <td>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</td>
      <td>
        <span className={`order-status-badge status-${order.orderStatus}`}>
          {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
        </span>
      </td>
      <td>{formatDate(order.createdAt)}</td>
      <td className="admin-table-actions-cell">
        <DropdownActionMenu items={actions} />
      </td>
    </tr>
  );
}

export default OrderTableRow;
