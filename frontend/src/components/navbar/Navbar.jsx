import { useEffect, useState } from 'react';
import NavLogo from './NavLogo';
import NavMenu from './NavMenu';
import NavIcons from './NavIcons';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <nav>
      <header>
        {}
        <div
          className="bx bx-menu"
          id="menu-icon"
          role="button"
          aria-label="Mở menu điều hướng"
          tabIndex={0}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setMobileMenuOpen((prev) => !prev);
          }}
        ></div>
        <NavLogo />
        <NavMenu isMobileOpen={mobileMenuOpen} onNavigate={() => setMobileMenuOpen(false)} />
        <NavIcons />
      </header>
      {mobileMenuOpen && (
        <div
          className="nav-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </nav>
  );
}

export default Navbar;
