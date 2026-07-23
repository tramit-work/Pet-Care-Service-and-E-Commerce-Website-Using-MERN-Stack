import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import Snackbar from '../components/shopping/Snackbar';

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, subtotal, updateQuantity, removeItem } = useCart();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [snackbarMessage, setSnackbarMessage] = useState(null);

  useEffect(() => {
    setSelectedIds(new Set(cartItems.map((item) => item.product?._id).filter(Boolean)));
  }, [cartItems.map((i) => i.product?._id).join(',')]);

  const allSelected = cartItems.length > 0 && cartItems.every((item) => selectedIds.has(item.product?._id));

  function toggleSelect(productId) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cartItems.map((item) => item.product?._id).filter(Boolean)));
    }
  }

  async function handleRemoveSelected() {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await removeItem(id);
    }
  }

  async function handleDecrease(item) {
    const result = await updateQuantity(item.product._id, item.quantity - 1);
    if (!result.success) {
      setSnackbarMessage(result.error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  }

  async function handleIncrease(item) {
    const result = await updateQuantity(item.product._id, item.quantity + 1);
    if (!result.success) {
      setSnackbarMessage(result.error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  }

  function handleRemove(item) {
    removeItem(item.product._id);
  }

  const selectedSubtotal = cartItems.reduce((sum, item) => {
    if (!item.product || !selectedIds.has(item.product._id)) return sum;
    return sum + (item.lineTotal ?? item.product.price * item.quantity);
  }, 0);

  if (cartItems.length === 0) {
    return (
      <div className="cart-page site-container">
        <div className="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="cart-empty-icon">
            <circle cx="9" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.5 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L21.5 8H6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>Giỏ hàng đang trống.</p>
          <Link to="/shopping" className="cart-empty-cta">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page site-container">
      <h1 className="cart-title">Giỏ hàng</h1>

      <div className="cart-toolbar">
        <label className="cart-toolbar-select-all">
          <input type="checkbox" className="cart-item-checkbox" checked={allSelected} onChange={toggleSelectAll} />
          Chọn tất cả ({cartItems.length} sản phẩm)
        </label>
        <button type="button" className="cart-toolbar-remove-selected" onClick={handleRemoveSelected} disabled={selectedIds.size === 0}>
          Xóa đã chọn ({selectedIds.size})
        </button>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => {
            const product = item.product;
            if (!product) return null;
            const lineTotal = item.lineTotal ?? product.price * item.quantity;

            return (
              <div className="cart-item" key={item._id}>
                <input
                  type="checkbox"
                  className="cart-item-checkbox"
                  checked={selectedIds.has(product._id)}
                  onChange={() => toggleSelect(product._id)}
                  aria-label={`Chọn ${product.name}`}
                />

                <div className="cart-item-image">
                  <img src={product.image} alt={product.name} loading="lazy" />
                </div>

                <div className="cart-item-info">
                  <p className="cart-item-name">{product.name}</p>
                  <p className="cart-item-price">{formatPrice(product.price)}đ</p>
                </div>

                <div className="cart-item-quantity">
                  <button type="button" onClick={() => handleDecrease(item)} aria-label="Giảm số lượng">
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => handleIncrease(item)} aria-label="Tăng số lượng">
                    +
                  </button>
                </div>

                <p className="cart-item-total">{formatPrice(lineTotal)}đ</p>

                <button type="button" className="cart-item-remove" onClick={() => handleRemove(item)}>
                  Xóa
                </button>
              </div>
            );
          })}
        </div>

        <aside className="cart-summary">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="cart-summary-row">
            <span>Tạm tính ({selectedIds.size} sản phẩm đã chọn)</span>
            <span>{formatPrice(selectedSubtotal)}đ</span>
          </div>
          <div className="cart-summary-row">
            <span>Phí vận chuyển</span>
            <span>Miễn phí</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Tổng cộng</span>
            <span>{formatPrice(selectedSubtotal)}đ</span>
          </div>
          {selectedIds.size < cartItems.length && (
            <p className="cart-summary-hint">* Đơn hàng khi thanh toán sẽ gồm toàn bộ {cartItems.length} sản phẩm trong giỏ (tổng {formatPrice(subtotal)}đ).</p>
          )}
          <button type="button" className="cart-checkout-btn" onClick={() => navigate('/checkout')}>
            Thanh toán
          </button>
        </aside>
      </div>

      <Snackbar message={snackbarMessage} onHide={() => setSnackbarMessage(null)} />
    </div>
  );
}

export default CartPage;
