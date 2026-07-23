import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../assets/styles/account-menu.css';

function NavAccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate('/');
  }

  const displayName = user?.fullName?.trim().split(' ').pop() || 'Tài khoản';

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        type="button"
        className="account-menu-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Menu tài khoản"
      >
        <i className="bx bx-user-circle"></i>
        <span className="account-login-indicator" aria-hidden="true"></span>
        <span className="account-menu-name">{displayName}</span>
      </button>

      {open && (
        <div className="account-menu-dropdown" role="menu">
          <Link to="/profile" className="account-menu-item" role="menuitem" onClick={() => setOpen(false)}>
            Hồ sơ
          </Link>
          <button
            type="button"
            className="account-menu-item account-menu-logout"
            role="menuitem"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export default NavAccountMenu;
