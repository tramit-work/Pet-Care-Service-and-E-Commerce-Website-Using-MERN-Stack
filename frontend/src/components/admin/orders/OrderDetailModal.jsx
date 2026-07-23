import Modal from '../Modal';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../../../utils/adminConstants';

function OrderDetailModal({ order, stt, onClose }) {
  return (
    <Modal title={`Chi tiết đơn hàng ${order.orderCode}`} onClose={onClose} size="lg">
      <div className="admin-detail-grid">
        <div className="admin-detail-item">
          <div className="admin-detail-label">Mã đơn hàng</div>
          <div className="admin-detail-value">
            <span className="admin-booking-code">{order.orderCode}</span>
          </div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">STT</div>
          <div className="admin-detail-value">{stt}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Người nhận</div>
          <div className="admin-detail-value">{order.receiverName}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Số điện thoại</div>
          <div className="admin-detail-value">{order.phone}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Email</div>
          <div className="admin-detail-value">{order.user?.email || '—'}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Trạng thái</div>
          <div className="admin-detail-value">
            <span className={`order-status-badge status-${order.orderStatus}`}>
              {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
            </span>
          </div>
        </div>
        <div className="admin-detail-item full">
          <div className="admin-detail-label">Địa chỉ giao hàng</div>
          <div className="admin-detail-value">{order.address}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Phương thức thanh toán</div>
          <div className="admin-detail-value">{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Ngày tạo</div>
          <div className="admin-detail-value">{formatDate(order.createdAt)}</div>
        </div>
        <div className="admin-detail-item full">
          <div className="admin-detail-label">Ghi chú</div>
          <div className="admin-detail-value">{order.note || '—'}</div>
        </div>

        <div className="admin-detail-item full">
          <div className="admin-detail-label">Sản phẩm</div>
          <div className="admin-order-items">
            {order.items.map((item, idx) => (
              <div className="admin-order-item-row" key={idx}>
                <img src={item.image} alt={item.name} className="admin-table-thumb" />
                <div className="admin-order-item-info">
                  <p className="admin-order-item-name">{item.name}</p>
                  <p className="admin-order-item-meta">
                    {formatPrice(item.price)}đ × {item.quantity}
                  </p>
                </div>
                <span className="admin-order-item-total">{formatPrice(item.price * item.quantity)}đ</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-detail-item full">
          <div className="admin-detail-label">Tổng kết thanh toán</div>
          <div className="admin-order-totals">
            <div>
              <span>Tổng tiền hàng</span>
              <span>{formatPrice(order.totalAmount)}đ</span>
            </div>
            <div>
              <span>Phí vận chuyển</span>
              <span>{formatPrice(order.shippingFee)}đ</span>
            </div>
            <div>
              <span>Giảm giá</span>
              <span>{formatPrice(order.discount)}đ</span>
            </div>
            <div className="admin-order-total-final">
              <span>Thành tiền</span>
              <span>{formatPrice(order.finalAmount)}đ</span>
            </div>
          </div>
        </div>

        {Array.isArray(order.statusHistory) && order.statusHistory.length > 0 && (
          <div className="admin-detail-item full">
            <div className="admin-detail-label">Lịch sử trạng thái</div>
            <ul className="admin-detail-history">
              {order.statusHistory.map((h, i) => (
                <li key={i}>
                  {ORDER_STATUS_LABELS[h.status] || h.status} — {formatDate(h.updatedAt)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default OrderDetailModal;
