import Modal from '../Modal';
import StarRating from '../../shared/StarRating';
import { formatDate } from '../../../utils/formatDate';

function ReviewDetailModal({ review, onClose }) {
  return (
    <Modal title="Chi tiết đánh giá" onClose={onClose} size="md">
      <div className="admin-detail-grid">
        <div className="admin-detail-item">
          <div className="admin-detail-label">Người đánh giá</div>
          <div className="admin-detail-value">{review.user?.fullName || '—'}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Email</div>
          <div className="admin-detail-value">{review.user?.email || '—'}</div>
        </div>
        <div className="admin-detail-item full">
          <div className="admin-detail-label">Sản phẩm</div>
          <div className="admin-detail-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {review.product?.image && <img src={review.product.image} alt={review.product.name} className="admin-table-thumb" />}
            {review.product?.name || '—'}
          </div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Số sao</div>
          <div className="admin-detail-value">
            <StarRating value={review.rating} size={16} />
          </div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Trạng thái</div>
          <div className="admin-detail-value">
            <span className={`active-badge${review.status === 'active' ? ' active' : ' locked'}`}>
              {review.status === 'active' ? 'Hiển thị' : 'Đã ẩn'}
            </span>
          </div>
        </div>
        <div className="admin-detail-item full">
          <div className="admin-detail-label">Nội dung đánh giá</div>
          <div className="admin-detail-value">{review.comment}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Ngày tạo</div>
          <div className="admin-detail-value">{formatDate(review.createdAt)}</div>
        </div>
        <div className="admin-detail-item">
          <div className="admin-detail-label">Cập nhật gần nhất</div>
          <div className="admin-detail-value">{formatDate(review.updatedAt)}</div>
        </div>
      </div>
    </Modal>
  );
}

export default ReviewDetailModal;
