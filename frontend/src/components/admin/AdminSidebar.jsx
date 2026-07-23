import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ADMIN_NAV_ITEMS } from './adminNavItems';

const ROLE_LABELS = { admin: 'Quản trị viên', editor: 'Biên tập viên' };

function AdminSidebar({ mobileOpen, onClose }) {
  const { user } = useAdminAuth();
  const visibleItems = ADMIN_NAV_ITEMS.filter((item) => item.roles.includes(user?.role));
  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || '?';

  return (
    <>
      {mobileOpen && <div className="admin-sidebar-overlay" onClick={onClose}></div>}
      <aside className={`admin-sidebar${mobileOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-header">
          <span className="admin-sidebar-logo">Cuc Pet Admin</span>
          <button type="button" className="admin-sidebar-close" onClick={onClose} aria-label="Đóng menu">
            ×
          </button>
        </div>

        <div className="admin-sidebar-profile">
          <div className="admin-sidebar-avatar">{initial}</div>
          <div className="admin-sidebar-profile-info">
            <p className="admin-sidebar-profile-name">{user?.fullName || 'Quản trị viên'}</p>
            <span className="admin-sidebar-profile-role">{ROLE_LABELS[user?.role] || user?.role}</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <span className="admin-sidebar-nav-label">Quản lý</span>
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => `admin-sidebar-link${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <i className={`bx ${item.icon}`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default AdminSidebar;
