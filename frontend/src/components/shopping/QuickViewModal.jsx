import { useEffect, useState } from 'react';
import ReviewList from '../shared/ReviewList';
import StarRating from '../shared/StarRating';
import { useAddToCartFeedback } from '../../utils/useAddToCartFeedback';

const LOW_STOCK_THRESHOLD = 5;

function QuickViewModal({ product, onClose, showSnackbar }) {
  const [displayedProduct, setDisplayedProduct] = useState(product);
  const [isShowing, setIsShowing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { handleAddToCart } = useAddToCartFeedback(showSnackbar);

  const hasKnownStock = typeof displayedProduct?.stock === 'number';
  const stock = displayedProduct?.stock ?? 0;
  const outOfStock = hasKnownStock && stock === 0;

  function handleDecreaseQuantity() {
    setQuantity((q) => Math.max(1, q - 1));
  }

  function handleIncreaseQuantity() {
    setQuantity((q) => (hasKnownStock ? Math.min(stock, q + 1) : q + 1));
  }

  async function handleAddToCartClick() {
    await handleAddToCart(displayedProduct.id, quantity, {
      from: '/shopping',
      successMessage: 'Đã thêm vào giỏ hàng!',
    });
  }

  async function handleBuyNow() {
    const result = await handleAddToCart(displayedProduct.id, quantity, { from: '/shopping' });
    if (result.success) {
      onClose();
    }
  }

  useEffect(() => {
    if (product) {
      setDisplayedProduct(product);
      setQuantity(1);
      const openTimer = setTimeout(() => setIsShowing(true), 10);
      return () => clearTimeout(openTimer);
    }

    setIsShowing(false);
    const closeTimer = setTimeout(() => setDisplayedProduct(null), 300);
    return () => clearTimeout(closeTimer);
  }, [product]);

  return (
    <div
      id="quickViewModal"
      className={`modal-shopping${isShowing ? ' show' : ''}`}
      style={{ display: displayedProduct ? 'flex' : 'none' }}
    >
      {displayedProduct && (
        <div className="modal-content-shopping">
          <button className="close-modal-shopping" onClick={onClose} aria-label="Đóng">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="currentColor"
                d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.7a1 1 0 0 0-1.41 1.42l4.88 4.88-4.88 4.88a1 1 0 1 0 1.41 1.42L12 13.41l4.88 4.88a1 1 0 0 0 1.42-1.42l-4.88-4.88 4.88-4.88a1 1 0 0 0 0-1.42Z"
              />
            </svg>
          </button>

          <div className="modal-body-shopping">
            <div className="modal-image-wrap-shopping">
              <img id="modalImage-shopping" src={displayedProduct.image} alt={displayedProduct.name} />
            </div>

            <div className="modal-details-shopping">
              <h2 id="modalTitle-shopping">{displayedProduct.name}</h2>

              <div className="modal-rating-row">
                <StarRating value={displayedProduct.rating || 0} size={16} />
                <span className="modal-rating-count">
                  {displayedProduct.numReviews > 0 ? `(${displayedProduct.numReviews} đánh giá)` : '(0)'}
                </span>
                {!displayedProduct.numReviews && <span className="modal-no-rating-text">Chưa có đánh giá</span>}
              </div>

              <p className="modal-price-shopping" id="modalPrice-shopping">
                Giá: {displayedProduct.price}đ
              </p>

              {hasKnownStock && (
                <p className={`modal-stock-status${outOfStock ? ' out' : stock <= LOW_STOCK_THRESHOLD ? ' low' : ' ok'}`}>
                  {outOfStock
                    ? '❌ Hết hàng'
                    : stock <= LOW_STOCK_THRESHOLD
                    ? `⚠ Chỉ còn ${stock} sản phẩm`
                    : `✔ Còn ${stock} sản phẩm`}
                </p>
              )}

              <p id="modalDescription-shopping" className="modal-description-shopping">
                {displayedProduct.quickDescription}
              </p>

              {(displayedProduct.categoryName || displayedProduct.brand) && (
                <div className="modal-meta-shopping">
                  {displayedProduct.categoryName && (
                    <span>
                      Danh mục: <strong>{displayedProduct.categoryName}</strong>
                    </span>
                  )}
                  {displayedProduct.brand && (
                    <span>
                      Thương hiệu: <strong>{displayedProduct.brand}</strong>
                    </span>
                  )}
                </div>
              )}

              {!outOfStock && (
                <div className="modal-quantity-selector">
                  <span className="modal-quantity-label">Số lượng</span>
                  <div className="modal-quantity-controls">
                    <button
                      type="button"
                      onClick={handleDecreaseQuantity}
                      disabled={quantity <= 1}
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <span className="modal-quantity-value">{quantity}</span>
                    <button
                      type="button"
                      onClick={handleIncreaseQuantity}
                      disabled={hasKnownStock && quantity >= stock}
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="modal-actions-shopping">
                <button className="btn-add-cart-modal" onClick={handleAddToCartClick} disabled={outOfStock}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.5 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L21.5 8H6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Thêm vào giỏ
                </button>
                <button className="btn-buy" onClick={handleBuyNow} disabled={outOfStock}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
                  </svg>
                  Mua ngay
                </button>
              </div>

              <div className="modal-trust-info">
                <p>✓ Giao hàng toàn quốc</p>
                <p>✓ Đổi trả trong 7 ngày</p>
                <p>✓ Thanh toán khi nhận hàng</p>
              </div>
            </div>
          </div>

          {displayedProduct.id && <ReviewList productId={displayedProduct.id} />}
        </div>
      )}
    </div>
  );
}

export default QuickViewModal;
