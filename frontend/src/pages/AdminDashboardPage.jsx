import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/adminService';
import { formatPrice } from '../utils/formatPrice';
import { formatDate } from '../utils/formatDate';
import StatCard from '../components/admin/StatCard';
import DashboardSection from '../components/admin/DashboardSection';
import DashboardTable from '../components/admin/DashboardTable';
import DashboardEmpty from '../components/admin/DashboardEmpty';
import DashboardSkeleton from '../components/admin/DashboardSkeleton';
import AdminErrorState from '../components/admin/AdminErrorState';
import RevenueChart from '../components/admin/RevenueChart';
import OrderStatusChart from '../components/admin/OrderStatusChart';
import OrderVolumeChart from '../components/admin/OrderVolumeChart';

const ORDER_STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const BOOKING_STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const ROLE_LABELS = { admin: 'Admin', editor: 'Editor', user: 'User' };


function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboard();
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được dữ liệu Dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <AdminErrorState message={error} onRetry={load} />;
  }

  const { summary, revenueChart, orderChart, statusChart, recentOrders, recentBookings, recentUsers } = data;

  const statCards = [
    { icon: 'bx-group', title: 'Tổng User', value: summary.users, color: '#6b7280' },
    { icon: 'bx-package', title: 'Tổng Product', value: summary.products, color: '#6b7280' },
    { icon: 'bx-calendar-check', title: 'Tổng Booking', value: summary.bookings, color: '#6b7280' },
    { icon: 'bx-cart-alt', title: 'Tổng Order', value: summary.orders, color: '#2563eb' },
    { icon: 'bx-hourglass', title: 'Order chờ xử lý', value: summary.pendingOrders, color: '#f59e0b' },
    { icon: 'bx-wallet', title: 'Tổng doanh thu', value: `${formatPrice(summary.totalRevenue)}đ`, color: '#16a34a' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-welcome">
        <h1>Dashboard</h1>
        <p>Tổng quan hoạt động hệ thống.</p>
      </div>

      <div className="stat-cards-grid">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="dashboard-charts-row">
        <RevenueChart
          data={revenueChart}
          todayRevenue={summary.todayRevenue}
          weekRevenue={summary.weekRevenue}
          monthRevenue={summary.monthRevenue}
        />
        <OrderStatusChart data={statusChart} />
      </div>

      <OrderVolumeChart data={orderChart} />

      <DashboardSection
        title="Đơn hàng gần đây"
        action={
          <Link to="/admin/orders" className="dashboard-view-all">
            Xem tất cả →
          </Link>
        }
      >
        {recentOrders.length === 0 ? (
          <DashboardEmpty message="Chưa có đơn hàng nào." />
        ) : (
          <DashboardTable headers={['Mã đơn', 'Khách hàng', 'Trạng thái', 'Tổng tiền', 'Ngày đặt']}>
            {recentOrders.slice(0, 5).map((order) => (
              <tr key={order._id}>
                <td>{order.orderCode}</td>
                <td>{order.receiverName}</td>
                <td>
                  <span className={`order-status-badge status-${order.orderStatus}`}>
                    {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
                  </span>
                </td>
                <td>{formatPrice(order.finalAmount)}đ</td>
                <td>{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </DashboardTable>
        )}
      </DashboardSection>

      <DashboardSection
        title="Đặt lịch gần đây"
        action={
          <Link to="/admin/bookings" className="dashboard-view-all">
            Xem tất cả →
          </Link>
        }
      >
        {recentBookings.length === 0 ? (
          <DashboardEmpty message="Chưa có lịch đặt nào." />
        ) : (
          <DashboardTable headers={['Khách hàng', 'Dịch vụ', 'Ngày đặt lịch', 'Trạng thái']}>
            {recentBookings.slice(0, 5).map((booking) => (
              <tr key={booking._id}>
                <td>{booking.customerName}</td>
                <td>{booking.serviceType}</td>
                <td>{formatDate(booking.bookingDate)}</td>
                <td>
                  <span className={`order-status-badge status-${booking.status}`}>
                    {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </DashboardTable>
        )}
      </DashboardSection>

      <DashboardSection
        title="Người dùng mới"
        action={
          <Link to="/admin/users" className="dashboard-view-all">
            Xem tất cả →
          </Link>
        }
      >
        {recentUsers.length === 0 ? (
          <DashboardEmpty message="Chưa có người dùng nào." />
        ) : (
          <DashboardTable headers={['', 'Họ tên', 'Email', 'Vai trò', 'Trạng thái']}>
            {recentUsers.slice(0, 5).map((u) => (
              <tr key={u._id}>
                <td>
                  <div className="dashboard-avatar">{u.fullName?.trim().charAt(0).toUpperCase() || '?'}</div>
                </td>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge role-${u.role}`}>{ROLE_LABELS[u.role] || u.role}</span>
                </td>
                <td>
                  <span className={`active-badge${u.isActive ? ' active' : ' locked'}`}>
                    {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
              </tr>
            ))}
          </DashboardTable>
        )}
      </DashboardSection>
    </div>
  );
}

export default AdminDashboardPage;
