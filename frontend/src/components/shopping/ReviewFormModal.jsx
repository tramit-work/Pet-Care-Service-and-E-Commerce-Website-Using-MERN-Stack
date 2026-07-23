import { useState } from 'react';
import { createReview, updateReview } from '../../api/reviewService';
import StarRating from '../shared/StarRating';

const MAX_COMMENT_LENGTH = 500;

function ReviewFormModal({ orderId, productId, productName, existingReview, onClose, onSuccess }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(existingReview);

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Vui lòng chọn số sao đánh giá (1–5).');
      return;
    }
    if (!comment.trim()) {
      setError('Vui lòng nhập nội dung đánh giá.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        await updateReview(existingReview._id, { rating, comment: comment.trim() });
      } else {
        await createReview({ order: orderId, product: productId, rating, comment: comment.trim() });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <button type="button" className="order-modal-close" onClick={onClose} aria-label="Đóng">
          ×
        </button>
        <h2>{isEdit ? 'Sửa đánh giá' : 'Đánh giá sản phẩm'}</h2>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: 16 }}>{productName}</p>

        <form onSubmit={handleSubmit}>
          <div className="review-form-group">
            <label className="review-form-label">Số sao</label>
            <StarRating value={rating} interactive size={28} onChange={setRating} />
          </div>

          <div className="review-form-group">
            <label className="review-form-label">Nội dung đánh giá</label>
            <textarea
              className="review-form-textarea"
              value={comment}
              maxLength={MAX_COMMENT_LENGTH}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
              disabled={submitting}
            />
            <p className="review-form-charcount">
              {comment.length}/{MAX_COMMENT_LENGTH}
            </p>
          </div>

          {error && <p className="review-form-error">{error}</p>}

          <button type="submit" className="review-form-submit" disabled={submitting}>
            {submitting ? 'Đang gửi...' : isEdit ? 'Lưu thay đổi' : 'Gửi đánh giá'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReviewFormModal;
