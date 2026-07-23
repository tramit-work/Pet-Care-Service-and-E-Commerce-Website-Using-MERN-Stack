import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orderService';
import { formatPrice } from '../utils/formatPrice';
import { formatDateTime } from '../utils/formatDate';
import Snackbar from '../components/shopping/Snackbar';

const EMPTY_FORM = { receiverName: '', phone: '', address: '', note: '' };

const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};


function validateCheckoutForm(formData) {
  const errors = {};

  if (!formData.receiverName.trim()) {
    errors.receiverName = 'Họ tên không được để trống.';
  }

  if (!formData.phone.trim()) {
    errors.phone = 'Số điện thoại không được để trống.';
  } else if (!PHONE_REGEX.test(formData.phone.trim())) {
    errors.phone = 'Số điện thoại không hợp lệ.';
  }

  if (!formData.address.trim()) {
    errors.address = 'Địa chỉ không được để trống.';
  }

  return errors;
}

const CLIENT_REQUEST_ID_KEY = 'checkout_client_request_id';

function getOrCreateClientRequestId() {
  const existing = sessionStorage.getItem(CLIENT_REQUEST_ID_KEY);
  if (existing) return existing;
  const fresh = crypto.randomUUID();
  sessionStorage.setItem(CLIENT_REQUEST_ID_KEY, fresh);
  return fresh;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, subtotal, loadCart } = useCart();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const [clientRequestId] = useState(getOrCreateClientRequestId);

  const [paymentMethod, setPaymentMethod] = useState('store_pickup');
  const shippingFee = paymentMethod === 'cod' ? 30000 : 0;

  function showSnackbar(message) {
    setSnackbarMessage(message);
  }

  function handleFieldChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  async function handleSubmit() {
    if (submitting || placedOrder) return; 

    const validationErrors = validateCheckoutForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({ ...formData, paymentMethod, clientRequestId });
      setPlacedOrder(order);

      sessionStorage.removeItem(CLIENT_REQUEST_ID_KEY);
      await loadCart();
    } catch (err) {
      const message = err.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại.';
      showSnackbar(message);
      setSubmitting(false);
    }
  }

  if (placedOrder) {
    return (
      <div className="checkout-page site-container">
        <div className="order-success-view">
          <h1 className="order-success-heading">Đặt hàng thành công!</h1>

          <div className="order-success-code-block">
            <span className="order-success-code-label">Mã đơn hàng của bạn</span>
            <span className="order-success-code-value">{placedOrder.orderCode}</span>
          </div>

          <div className="order-success-details">
            <div className="order-success-row">
              <span>Thời gian đặt</span>
              <span>{formatDateTime(placedOrder.createdAt)}</span>
            </div>
            <div className="order-success-row">
              <span>Trạng thái</span>
              <span className={`order-status-badge status-${placedOrder.orderStatus}`}>
                {STATUS_LABELS[placedOrder.orderStatus] || placedOrder.orderStatus}
              </span>
            </div>
            <div className="order-success-row order-success-total">
              <span>Tổng tiền</span>
              <span>{formatPrice(placedOrder.finalAmount)}đ</span>
            </div>
          </div>

          <div className="order-success-actions">
            <button
              type="button"
              className="order-success-view-btn"
              onClick={() => navigate('/orders', { state: { justCreatedOrderCode: placedOrder.orderCode } })}
            >
              Xem đơn hàng
            </button>
            <Link to="/shopping" className="order-success-continue-btn">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page site-container">
        <div className="checkout-empty">
          <p>Giỏ hàng đang trống, không thể đặt hàng.</p>
          <Link to="/shopping" className="checkout-empty-cta">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page site-container">
      <h1 className="checkout-title">Thanh toán</h1>

      <div className="checkout-layout">
        <div className="checkout-main">
          <section className="checkout-section">
            <h2>Thông tin người nhận</h2>

            <div className="checkout-field">
              <label htmlFor="checkout-name">Họ tên</label>
              <input
                id="checkout-name"
                type="text"
                className={`checkout-input${errors.receiverName ? ' has-error' : ''}`}
                placeholder="Nhập họ tên người nhận"
                value={formData.receiverName}
                onChange={(e) => handleFieldChange('receiverName', e.target.value)}
                disabled={submitting}
              />
              {errors.receiverName && <p className="checkout-error">{errors.receiverName}</p>}
            </div>

            <div className="checkout-field">
              <label htmlFor="checkout-email">Email</label>
              <input
                id="checkout-email"
                type="email"
                className="checkout-input"
                value={user?.email || ''}
                readOnly
                disabled
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="checkout-phone">Số điện thoại</label>
              <input
                id="checkout-phone"
                type="tel"
                className={`checkout-input${errors.phone ? ' has-error' : ''}`}
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                disabled={submitting}
              />
              {errors.phone && <p className="checkout-error">{errors.phone}</p>}
            </div>

            <div className="checkout-field">
              <label htmlFor="checkout-address">Địa chỉ</label>
              <input
                id="checkout-address"
                type="text"
                className={`checkout-input${errors.address ? ' has-error' : ''}`}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                value={formData.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                disabled={submitting}
              />
              {errors.address && <p className="checkout-error">{errors.address}</p>}
            </div>

            <div className="checkout-field">
              <label htmlFor="checkout-note">Ghi chú (không bắt buộc)</label>
              <textarea
                id="checkout-note"
                className="checkout-input checkout-textarea"
                placeholder="Ví dụ: giao giờ hành chính"
                value={formData.note}
                onChange={(e) => handleFieldChange('note', e.target.value)}
                disabled={submitting}
              />
            </div>
          </section>

          <section className="checkout-section">
            <h2>Sản phẩm ({cartItems.length})</h2>
            <div className="checkout-product-list">
              {cartItems.map((item) => (
                <div className="checkout-product-row" key={item._id}>
                  <div className="checkout-product-image">
                    <img src={item.product.image} alt={item.product.name} loading="lazy" />
                  </div>
                  <div className="checkout-product-info">
                    <p className="checkout-product-name">{item.product.name}</p>
                    <p className="checkout-product-price">{formatPrice(item.product.price)}đ</p>
                  </div>
                  <span className="checkout-product-qty">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="checkout-section">
            <h2>Phương thức thanh toán</h2>
            <div className="checkout-payment-options">
              <label className={`checkout-payment-option${paymentMethod === 'store_pickup' ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'store_pickup'}
                  onChange={() => setPaymentMethod('store_pickup')}
                />
                Nhận tại cửa hàng
                <span className="checkout-payment-shipping-fee">Phí vận chuyển: 0đ</span>
              </label>
              <label className={`checkout-payment-option${paymentMethod === 'cod' ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                Thanh toán khi nhận hàng
                <span className="checkout-payment-shipping-fee">Phí vận chuyển: 30.000đ</span>
              </label>
            </div>
          </section>
        </div>

        <aside className="checkout-summary">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="checkout-summary-row">
            <span>Tổng tiền hàng</span>
            <span>{formatPrice(subtotal)}đ</span>
          </div>
          <div className="checkout-summary-row">
            <span>Phí vận chuyển</span>
            <span>{shippingFee === 0 ? 'Miễn phí' : `${formatPrice(shippingFee)}đ`}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Giảm giá</span>
            <span>0đ</span>
          </div>
          <div className="checkout-summary-row checkout-summary-total">
            <span>Thành tiền</span>
            <span>{formatPrice(subtotal + shippingFee)}đ</span>
          </div>
          <button type="button" className="checkout-submit-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting && <span className="booking-spinner" aria-hidden="true"></span>}
            {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
          </button>
        </aside>
      </div>

      <Snackbar message={snackbarMessage} onHide={() => setSnackbarMessage(null)} />
    </div>
  );
}

export default CheckoutPage;
