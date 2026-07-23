import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { getWishlist } from '../api/wishlistService';
import { getMyOrders } from '../api/orderService';
import { getBookings } from '../api/bookingService';
import AvatarUploader from '../components/profile/AvatarUploader';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import EmailVerificationStatus from '../components/profile/EmailVerificationStatus';
import SessionList from '../components/profile/SessionList';
import Snackbar from '../components/shopping/Snackbar';

const ROLE_LABELS = {
  admin: 'Quản trị viên',
  user: 'Khách hàng',
};

const STATS_FETCH_LIMIT = 200;

function formatJoinDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

function countOrderStats(orders) {
  const stats = { total: orders.length, processing: 0, completed: 0, cancelled: 0 };
  orders.forEach((o) => {
    if (o.orderStatus === 'completed') stats.completed += 1;
    else if (o.orderStatus === 'cancelled') stats.cancelled += 1;
    else stats.processing += 1; 
  });
  return stats;
}

function countBookingStats(bookings) {
  const stats = { total: bookings.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  bookings.forEach((b) => {
    if (stats[b.status] !== undefined) stats[b.status] += 1;
  });
  return stats;
}

function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  const [orderStats, setOrderStats] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [bookingStats, setBookingStats] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(true);

  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWishlistPreview() {
      setWishlistLoading(true);
      try {
        const data = await getWishlist();
        if (!cancelled) setWishlistItems(data);
      } catch (err) {
        if (!cancelled) setWishlistItems([]);
      } finally {
        if (!cancelled) setWishlistLoading(false);
      }
    }

    loadWishlistPreview();
    return () => {
      cancelled = true;
    };
  }, [wishlistCount]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setOrderLoading(true);
      setBookingLoading(true);
      try {
        const { items } = await getMyOrders({ limit: STATS_FETCH_LIMIT });
        if (!cancelled) setOrderStats(countOrderStats(items || []));
      } catch (err) {
        if (!cancelled) setOrderStats(null);
      } finally {
        if (!cancelled) setOrderLoading(false);
      }

      try {
        const { items } = await getBookings({ limit: STATS_FETCH_LIMIT });
        if (!cancelled) setBookingStats(countBookingStats(items || []));
      } catch (err) {
        if (!cancelled) setBookingStats(null);
      } finally {
        if (!cancelled) setBookingLoading(false);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || '?';
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'Chưa cập nhật';
  const joinDate = formatJoinDate(user?.createdAt);

  const infoItems = [
    {
      key: 'fullName',
      label: 'Họ tên',
      value: user?.fullName,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      value: user?.email,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      key: 'phone',
      label: 'Điện thoại',
      value: user?.phone,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      key: 'address',
      label: 'Địa chỉ',
      value: user?.address,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 21s-7-6.3-7-11.5A7 7 0 0 1 19 9.5C19 14.7 12 21 12 21z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="9.5" r="2.3" />
        </svg>
      ),
    },
    {
      key: 'role',
      label: 'Vai trò',
      value: roleLabel,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2l3 6 6 .9-4.5 4.3 1 6.3-5.5-3-5.5 3 1-6.3L3 8.9 9 8z" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      key: 'joinDate',
      label: 'Ngày tham gia',
      value: joinDate,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  async function handleLogoutCurrentSession() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="profile-page site-container">
      <div className="profile-card">
        <div className="profile-header">
          <AvatarUploader
            user={user}
            onUpdated={setUser}
            onSuccess={setSnackbarMessage}
            onError={setSnackbarMessage}
          />
          <div className="profile-header-text">
            <h1>{user?.fullName || 'Chưa cập nhật'}</h1>
            <p>{user?.email}</p>
            <span className={`profile-role-badge role-${user?.role || 'user'}`}>{roleLabel}</span>
            <EmailVerificationStatus user={user} onSuccess={setSnackbarMessage} />
          </div>
        </div>

        {editingProfile ? (
          <ProfileEditForm
            user={user}
            onUpdated={setUser}
            onCancel={() => setEditingProfile(false)}
            onSuccess={setSnackbarMessage}
          />
        ) : (
          <div className="profile-info-grid">
            {infoItems.map((item) => (
              <div className="profile-info-item" key={item.key}>
                <div className="profile-info-icon">{item.icon}</div>
                <div>
                  <div className="profile-info-label">{item.label}</div>
                  <div className={`profile-info-value${item.value ? '' : ' empty'}`}>
                    {item.value || 'Chưa cập nhật'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {changingPassword && (
          <ChangePasswordForm
            hasPassword={user?.hasPassword !== false}
            onCancel={() => setChangingPassword(false)}
            onSuccess={setSnackbarMessage}
          />
        )}

        {!editingProfile && !changingPassword && (
          <div className="profile-actions">
            <button type="button" className="profile-btn-primary" onClick={() => setEditingProfile(true)}>
              Chỉnh sửa hồ sơ
            </button>
            <button type="button" className="profile-btn-secondary" onClick={() => setChangingPassword(true)}>
              Đổi mật khẩu
            </button>
          </div>
        )}
      </div>

      <div className="profile-placeholder-grid">
        <section className="profile-placeholder-card">
          <h2>Lịch đặt của tôi</h2>
          {bookingLoading ? (
            <p>Đang tải...</p>
          ) : !bookingStats || bookingStats.total === 0 ? (
            <p>Chưa có lịch đặt nào.</p>
          ) : (
            <div className="profile-stats-grid">
              <button type="button" className="profile-stat-item" onClick={() => navigate('/service')}>
                <span className="profile-stat-number">{bookingStats.total}</span>
                <span className="profile-stat-label">Tổng số lịch đặt</span>
              </button>
              <button type="button" className="profile-stat-item" onClick={() => navigate('/service')}>
                <span className="profile-stat-number">{bookingStats.pending}</span>
                <span className="profile-stat-label">Đang chờ</span>
              </button>
              <button type="button" className="profile-stat-item" onClick={() => navigate('/service')}>
                <span className="profile-stat-number">{bookingStats.confirmed}</span>
                <span className="profile-stat-label">Đã xác nhận</span>
              </button>
              <button type="button" className="profile-stat-item" onClick={() => navigate('/service')}>
                <span className="profile-stat-number">{bookingStats.completed}</span>
                <span className="profile-stat-label">Đã hoàn thành</span>
              </button>
            </div>
          )}
        </section>

        <section className="profile-placeholder-card">
          <h2>Đơn hàng của tôi</h2>
          {orderLoading ? (
            <p>Đang tải...</p>
          ) : !orderStats || orderStats.total === 0 ? (
            <p>Chưa có đơn hàng nào.</p>
          ) : (
            <div className="profile-stats-grid">
              <Link to="/orders" className="profile-stat-item">
                <span className="profile-stat-number">{orderStats.total}</span>
                <span className="profile-stat-label">Tổng số đơn hàng</span>
              </Link>
              <Link to="/orders" className="profile-stat-item">
                <span className="profile-stat-number">{orderStats.processing}</span>
                <span className="profile-stat-label">Đang xử lý</span>
              </Link>
              <Link to="/orders" className="profile-stat-item">
                <span className="profile-stat-number">{orderStats.completed}</span>
                <span className="profile-stat-label">Đã hoàn thành</span>
              </Link>
              <Link to="/orders" className="profile-stat-item">
                <span className="profile-stat-number">{orderStats.cancelled}</span>
                <span className="profile-stat-label">Đã hủy</span>
              </Link>
            </div>
          )}
        </section>

        <section className="profile-placeholder-card">
          <h2>Sản phẩm yêu thích</h2>
          {wishlistLoading ? (
            <p>Đang tải...</p>
          ) : wishlistCount === 0 ? (
            <p>Chưa có sản phẩm yêu thích nào.</p>
          ) : (
            <>
              <p className="profile-wishlist-count">Bạn có {wishlistCount} sản phẩm yêu thích.</p>
              <div className="profile-wishlist-thumbs">
                {wishlistItems.slice(0, 4).map(
                  (item) =>
                    item.product && (
                      <div className="profile-wishlist-thumb" key={item._id}>
                        <img src={item.product.image} alt={item.product.name} loading="lazy" />
                      </div>
                    )
                )}
                {wishlistCount > 4 && <div className="profile-wishlist-more">+{wishlistCount - 4}</div>}
              </div>
              <Link to="/wishlist" className="profile-wishlist-link">
                Xem tất cả →
              </Link>
            </>
          )}
        </section>

        <section className="profile-placeholder-card profile-sessions-card">
          <h2>Phiên đăng nhập</h2>
          <SessionList
            onLogoutCurrent={handleLogoutCurrentSession}
            onSuccess={setSnackbarMessage}
            onError={setSnackbarMessage}
          />
        </section>
      </div>

      <Snackbar message={snackbarMessage} onHide={() => setSnackbarMessage(null)} />
    </div>
  );
}

export default ProfilePage;
