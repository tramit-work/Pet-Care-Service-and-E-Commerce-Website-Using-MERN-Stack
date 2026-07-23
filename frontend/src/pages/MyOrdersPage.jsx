import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getMyOrders, cancelOrder as cancelOrderApi } from '../api/orderService';
import { getMyReviewForOrder } from '../api/reviewService';
import { formatPrice } from '../utils/formatPrice';
import { formatDate } from '../utils/formatDate';
import Snackbar from '../components/shopping/Snackbar';
import ReviewFormModal from '../components/shopping/ReviewFormModal';

const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const PAYMENT_METHOD_LABELS = {
  store_pickup: 'Nhận tại cửa hàng',
  cod: 'Thanh toán khi nhận hàng',
  bank_transfer: 'Chuyển khoản ngân hàng',
};


function MyOrdersPage() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [justCreatedOrderCode, setJustCreatedOrderCode] = useState(location.state?.justCreatedOrderCode || null);

  const [itemReviews, setItemReviews] = useState({});
  const [reviewTarget, setReviewTarget] = useState(null); // { item, existingReview }
  const [snackbarMessage, setSnackbarMessage] = useState(null);

  async function loadOrders() {
    try {
      const { items } = await getMyOrders();
      setOrders(items);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!selectedOrder || selectedOrder.orderStatus !== 'completed') {
      setItemReviews({});
      return;
    }

    let cancelled = false;
    const productIds = [...new Set(selectedOrder.items.map((i) => i.product).filter(Boolean))];

    Promise.all(productIds.map((pid) => getMyReviewForOrder(selectedOrder._id, pid).then((r) => [pid, r])))
      .then((pairs) => {
        if (cancelled) return;
        setItemReviews(Object.fromEntries(pairs));
      })
      .catch(() => {
        if (!cancelled) setItemReviews({});
      });

    return () => {
      cancelled = true;
    };
  }, [selectedOrder]);

  function handleReviewSuccess(productId) {
    setReviewTarget(null);
    setSnackbarMessage(reviewTarget?.existingReview ? 'Cập nhật đánh giá thành công!' : 'Đánh giá thành công!');
    
    getMyReviewForOrder(selectedOrder._id, productId).then((r) => {
      setItemReviews((prev) => ({ ...prev, [productId]: r }));
    });
  }

  async function handleCancel(order) {
    setCancellingId(order._id);
    setErrorMessage(null);
    try {
      const updated = await cancelOrderApi(order._id);
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      setSelectedOrder((prev) => (prev && prev._id === updated._id ? updated : prev));
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Hủy đơn thất bại, vui lòng thử lại.');
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return (
      <div className="orders-page site-container">
        <h1 className="orders-title">Đơn hàng của tôi</h1>
        <div className="orders-list">
          {[1, 2, 3].map((n) => (
            <div className="order-row" key={n}>
              <div className="order-row-skeleton-info">
                <div className="skeleton-block" style={{ width: 140, height: 20 }}></div>
                <div className="skeleton-block" style={{ width: 100, height: 14 }}></div>
              </div>
              <div className="skeleton-block" style={{ width: 90, height: 26 }}></div>
              <div className="skeleton-block" style={{ width: 80, height: 20 }}></div>
              <div className="skeleton-block" style={{ width: 100, height: 32 }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page site-container">
      <h1 className="orders-title">Đơn hàng của tôi</h1>

      {justCreatedOrderCode && (
        <div className="order-success-banner">
          <span className="order-success-banner-text">
            Đặt hàng thành công! Mã đơn hàng của bạn:
            <strong className="order-success-banner-code">{justCreatedOrderCode}</strong>
          </span>
          <button type="button" onClick={() => setJustCreatedOrderCode(null)} aria-label="Đóng thông báo">
            ×
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="orders-empty">
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link to="/shopping" className="orders-empty-cta">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-row" key={order._id}>
              <div className="order-row-info">
                <p className="order-row-code">{order.orderCode}</p>
                <p className="order-row-date">{formatDate(order.createdAt)}</p>
              </div>
              <span className={`order-status-badge status-${order.orderStatus}`}>
                {STATUS_LABELS[order.orderStatus] || order.orderStatus}
              </span>
              <p className="order-row-total">{formatPrice(order.finalAmount)}đ</p>
              <button type="button" className="order-row-detail-btn" onClick={() => setSelectedOrder(order)}>
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="order-modal-close" onClick={() => setSelectedOrder(null)} aria-label="Đóng">
              ×
            </button>

            <h2>Đơn hàng {selectedOrder.orderCode}</h2>
            <p className="order-modal-status">
              Trạng thái:{' '}
              <span className={`order-status-badge status-${selectedOrder.orderStatus}`}>
                {STATUS_LABELS[selectedOrder.orderStatus] || selectedOrder.orderStatus}
              </span>
            </p>

            <div className="order-modal-section">
              <h3>Người nhận</h3>
              <p>{selectedOrder.receiverName}</p>
              <p>{selectedOrder.phone}</p>
              <p>{selectedOrder.address}</p>
              {selectedOrder.note && <p className="order-modal-note">Ghi chú: {selectedOrder.note}</p>}
            </div>

            <div className="order-modal-section">
              <h3>Sản phẩm</h3>
              {selectedOrder.items.map((item, idx) => (
                <div className="order-modal-item" key={idx}>
                  <img src={item.image} alt={item.name} loading="lazy" />
                  <div>
                    <p>{item.name}</p>
                    <p className="order-modal-item-meta">
                      {formatPrice(item.price)}đ x {item.quantity}
                    </p>
                  </div>
                  <span>{formatPrice(item.price * item.quantity)}đ</span>
                  {selectedOrder.orderStatus === 'completed' && item.product && (
                    <button
                      type="button"
                      className={`order-modal-review-btn${itemReviews[item.product] ? ' reviewed' : ''}`}
                      onClick={() => setReviewTarget({ item, existingReview: itemReviews[item.product] || null })}
                    >
                      {itemReviews[item.product] ? 'Sửa đánh giá' : 'Đánh giá'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="order-modal-section">
              <h3>Thanh toán</h3>
              <p>{PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}</p>
              <div className="order-modal-totals">
                <div>
                  <span>Tổng tiền hàng</span>
                  <span>{formatPrice(selectedOrder.totalAmount)}đ</span>
                </div>
                <div>
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(selectedOrder.shippingFee)}đ</span>
                </div>
                <div>
                  <span>Giảm giá</span>
                  <span>{formatPrice(selectedOrder.discount)}đ</span>
                </div>
                <div className="order-modal-total-final">
                  <span>Thành tiền</span>
                  <span>{formatPrice(selectedOrder.finalAmount)}đ</span>
                </div>
              </div>
            </div>

            {errorMessage && <p className="checkout-error">{errorMessage}</p>}

            {selectedOrder.orderStatus === 'pending' && (
              <button
                type="button"
                className="order-modal-cancel-btn"
                onClick={() => handleCancel(selectedOrder)}
                disabled={cancellingId === selectedOrder._id}
              >
                {cancellingId === selectedOrder._id ? 'Đang hủy...' : 'Hủy đơn hàng'}
              </button>
            )}
          </div>
        </div>
      )}
      {reviewTarget && (
        <ReviewFormModal
          orderId={selectedOrder._id}
          productId={reviewTarget.item.product}
          productName={reviewTarget.item.name}
          existingReview={reviewTarget.existingReview}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => handleReviewSuccess(reviewTarget.item.product)}
        />
      )}

      <Snackbar message={snackbarMessage} onHide={() => setSnackbarMessage(null)} />
    </div>
  );
}

export default MyOrdersPage;
