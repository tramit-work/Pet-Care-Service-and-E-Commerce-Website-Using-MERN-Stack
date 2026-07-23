import { NavLink } from 'react-router-dom';

function NavMenu({ isMobileOpen, onNavigate }) {
  const links = [
    { to: '/', label: 'Trang chủ' },
    { to: '/shopping', label: 'Mua sắm' },
    { to: '/service', label: 'Dịch vụ' },
    { to: '/contact', label: 'Liên hệ' },
  ];

  return (
    <ul className={`nav-menu${isMobileOpen ? ' active' : ''}`}>
      {links.map((link) => (
        <li key={link.to}>
          <NavLink to={link.to} end={link.to === '/'} onClick={onNavigate}>
            {link.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export default NavMenu;
