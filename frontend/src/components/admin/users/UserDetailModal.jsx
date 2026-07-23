import { useEffect, useState } from 'react';
import Modal from '../Modal';
import { getAdminUserDetail } from '../../../api/adminUserService';
import { formatDate } from '../../../utils/formatDate';
import { USER_ROLE_LABELS } from '../../../utils/adminConstants';

function UserDetailModal({ userId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAdminUserDetail(userId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Không tải được thông tin người dùng.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <Modal title="Chi tiết người dùng" onClose={onClose} size="md">
      {loading && <p className="admin-form-hint">Đang tải...</p>}
      {error && <p className="admin-form-error">{error}</p>}

      {detail && (
        <div className="admin-detail-grid">
          <div className="admin-detail-item full" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {detail.user.avatar ? (
              <img src={detail.user.avatar} alt={detail.user.fullName} className="admin-table-thumb" style={{ borderRadius: '50%' }} />
            ) : (
              <div className="admin-table-thumb" style={{ borderRadius: '50%' }}></div>
            )}
            <div>
              <div className="admin-detail-value" style={{ fontWeight: 700 }}>{detail.user.fullName}</div>
              <div className="admin-detail-label">{detail.user.email}</div>
            </div>
          </div>

          <div className="admin-detail-item">
            <div className="admin-detail-label">Số điện thoại</div>
            <div className="admin-detail-value">{detail.user.phone || '—'}</div>
          </div>
          <div className="admin-detail-item">
            <div className="admin-detail-label">Vai trò</div>
            <div className="admin-detail-value">{USER_ROLE_LABELS[detail.user.role] || detail.user.role}</div>
          </div>
          <div className="admin-detail-item">
            <div className="admin-detail-label">Trạng thái</div>
            <div className="admin-detail-value">
              <span className={`active-badge${detail.user.isActive ? ' active' : ' locked'}`}>
                {detail.user.isActive ? 'Hoạt động' : 'Đã khóa'}
              </span>
            </div>
          </div>
          <div className="admin-detail-item">
            <div className="admin-detail-label">Ngày đăng ký</div>
            <div className="admin-detail-value">{formatDate(detail.user.createdAt)}</div>
          </div>
          <div className="admin-detail-item full">
            <div className="admin-detail-label">Địa chỉ (từ đơn hàng gần nhất)</div>
            <div className="admin-detail-value">{detail.lastOrderAddress || 'Chưa có đơn hàng nào'}</div>
          </div>

          <div className="admin-detail-item full">
            <div className="admin-detail-label">Số liệu hoạt động</div>
            <div className="admin-order-totals">
              <div>
                <span>Tổng số đơn hàng</span>
                <span>{detail.stats.orders}</span>
              </div>
              <div>
                <span>Tổng số lượt đặt lịch</span>
                <span>{detail.stats.bookings}</span>
              </div>
              <div>
                <span>Sản phẩm yêu thích</span>
                <span>{detail.stats.wishlist}</span>
              </div>
              <div>
                <span>Tổng số đánh giá</span>
                <span>{detail.stats.reviews}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default UserDetailModal;
