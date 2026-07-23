import StarRating from './StarRating';

function ProductCard({
  variant = 'home',
  title,
  image,
  alt,
  price,
  isNew,
  isSale,
  onClick,
  originalPrice,
  onQuickView,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  rating,
  numReviews,
}) {
  if (variant === 'shopping') {
    return (
      <article
        className="product-item"
        onClick={onClick}
        tabIndex={0}
        aria-label={alt || title}
      >
        {(isNew || isSale) && (
          <div className="product-labels">
            {isNew && <span className="product-label label-new-product">New</span>}
            {isSale && <span className="product-label label-on-sale">Sale</span>}
          </div>
        )}
        <div className="product-img-container">
          <button
            type="button"
            className={`product-wishlist-btn${isWishlisted ? ' active' : ''}`}
            aria-label={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
            aria-pressed={Boolean(isWishlisted)}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist?.();
            }}
          >
            <svg viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <img
            src={image}
            alt={alt || title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <p className="product-name">{title}</p>
        <div className="product-item-rating">
          <StarRating value={rating || 0} size={13} />
          <span className="product-item-rating-count">
            {numReviews > 0 ? `(${numReviews})` : '(0)'}
          </span>
          {!numReviews && <span className="product-no-rating-text">Chưa có đánh giá</span>}
        </div>
        <p className="product-price">
          {price}
          {originalPrice && <span className="original-price">{originalPrice}</span>}
        </p>
        <div className="product-item-actions">
          <button
            className="btn-quick-view"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.();
            }}
          >
            Xem nhanh
          </button>
          <button
            type="button"
            className="btn-add-to-cart"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.();
            }}
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </article>
    );
  }

  // variant === 'home' — giữ nguyên 100% như Bước 3, không thay đổi.
  return (
    <article className="product-card" onClick={onClick}>
      {(isNew || isSale) && (
        <div className="labels">
          {isNew && <span className="label label-new">New</span>}
          {isSale && <span className="label label-sale">Sale</span>}
        </div>
      )}
      <div className="product-image">
        <img
          src={image}
          alt={alt || title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <p className="product-title">{title}</p>
      <div className="product-card-rating">
        <StarRating value={rating || 0} size={13} />
        <span className="product-card-rating-count">
          {numReviews > 0 ? `(${numReviews})` : '(0)'}
        </span>
        {!numReviews && <span className="product-no-rating-text">Chưa có đánh giá</span>}
      </div>
      <p className="price">{price}</p>
    </article>
  );
}

export default ProductCard;
