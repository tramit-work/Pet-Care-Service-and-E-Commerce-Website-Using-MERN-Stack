import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminToastContainer from './AdminToastContainer';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminToastProvider } from '../../context/AdminToastContext';
import { ADMIN_NAV_ITEMS } from './adminNavItems';

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = ADMIN_NAV_ITEMS.find((item) =>
    item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to)
  );

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <AdminToastProvider>
      <div className="admin-layout">
        <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="admin-main">
          <header className="admin-topbar">
            <div className="admin-topbar-left">
              <button
                type="button"
                className="admin-hamburger"
                onClick={() => setMobileOpen(true)}
                aria-label="Mở menu quản trị"
              >
                <i className="bx bx-menu"></i>
              </button>
              <h1 className="admin-topbar-title">{currentPage?.label || 'Quản trị'}</h1>
            </div>

            <div className="admin-topbar-right">
              <Link to="/" className="admin-topbar-back">
                ← Về trang chủ
              </Link>
              <button type="button" className="admin-topbar-icon" aria-label="Thông báo">
                <i className="bx bx-bell"></i>
              </button>
              <div className="admin-topbar-avatar">{user?.fullName?.trim().charAt(0).toUpperCase() || '?'}</div>
              <span className="admin-topbar-user">{user?.fullName}</span>
              <button type="button" className="admin-topbar-logout" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          </header>

          <main className="admin-content">
            <Outlet />
          </main>
        </div>

        <AdminToastContainer />
      </div>
    </AdminToastProvider>
  );
}

export default AdminLayout;
