import { useEffect, useState } from 'react';
import { getProductReviews } from '../../api/reviewService';
import { formatDate } from '../../utils/formatDate';
import StarRating from './StarRating';
import RatingSummary from './RatingSummary';

const PAGE_LIMIT = 5;

function ReviewList({ productId, refreshKey }) {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [productId, refreshKey]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProductReviews(productId, { page, limit: PAGE_LIMIT })
      .then(({ items: data, summary: s, pagination }) => {
        if (cancelled) return;
        setItems(data);
        setSummary(s);
        setTotalPages(pagination?.totalPages || 1);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setSummary(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, page, refreshKey]);

  return (
    <div>
      <RatingSummary summary={summary} />

      {loading ? (
        <p className="review-list-status">Đang tải đánh giá...</p>
      ) : items.length === 0 ? (
        <p className="review-list-empty">Chưa có đánh giá nào cho sản phẩm này.</p>
      ) : (
        <>
          <div className="review-list">
            {items.map((review) => (
              <div className="review-list-item" key={review._id}>
                <div className="review-avatar">
                  {review.user?.avatar ? (
                    <img src={review.user.avatar} alt={review.user.fullName} />
                  ) : (
                    review.user?.fullName?.trim().charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <div className="review-content">
                  <div className="review-header">
                    <span className="review-author">{review.user?.fullName || 'Người dùng'}</span>
                    <StarRating value={review.rating} size={13} />
                    <span className="review-date">{formatDate(review.createdAt)}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination-controls" style={{ justifyContent: 'center', marginTop: 16 }}>
              <button
                type="button"
                className="admin-pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Trang trước"
              >
                <i className="bx bx-chevron-left"></i>
              </button>
              <span className="admin-pagination-info">
                Trang {page}/{totalPages}
              </span>
              <button
                type="button"
                className="admin-pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Trang sau"
              >
                <i className="bx bx-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ReviewList;
