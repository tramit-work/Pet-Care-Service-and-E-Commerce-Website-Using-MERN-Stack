import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist } from '../api/wishlistService';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatPrice';
import { useAddToCartFeedback } from '../utils/useAddToCartFeedback';
import Snackbar from '../components/shopping/Snackbar';

function WishlistPage() {
  const { toggleWishlist } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const { handleAddToCart } = useAddToCartFeedback(setSnackbarMessage);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getWishlist();
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRemove(productId) {
    setRemovingId(productId);
    const result = await toggleWishlist(productId);
    if (result.success) {
      setItems((prev) => prev.filter((item) => item.product?._id !== productId));
    }
    setRemovingId(null);
  }

  if (loading) {
    return <div className="wishlist-page site-container wishlist-loading">Đang tải danh sách yêu thích...</div>;
  }

  return (
    <div className="wishlist-page site-container">
      <h1 className="wishlist-title">Danh sách yêu thích</h1>

      {items.length === 0 ? (
        <div className="wishlist-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="wishlist-empty-icon">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>Bạn chưa có sản phẩm yêu thích nào.</p>
          <Link to="/shopping" className="wishlist-empty-cta">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <article className="wishlist-card" key={item._id}>
                <div className="wishlist-card-image">
                  <img src={product.image} alt={product.name} loading="lazy" />
                </div>
                <p className="wishlist-card-name">{product.name}</p>
                <p className="wishlist-card-price">{formatPrice(product.price)}đ</p>
                <div className="wishlist-card-actions">
                  <button
                    type="button"
                    className="wishlist-btn-add-cart"
                    onClick={() => handleAddToCart(product._id, 1, { from: '/wishlist' })}
                  >
                    Thêm vào giỏ hàng
                  </button>
                  <Link to="/shopping" className="wishlist-btn-view">
                    Xem chi tiết
                  </Link>
                  <button
                    type="button"
                    className="wishlist-btn-remove"
                    onClick={() => handleRemove(product._id)}
                    disabled={removingId === product._id}
                  >
                    {removingId === product._id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Snackbar message={snackbarMessage} onHide={() => setSnackbarMessage(null)} />
    </div>
  );
}

export default WishlistPage;
