import { Link } from 'react-router-dom';

function NavLogo() {
  return (
    <div className="logo-container">
      <Link to="/" className="logo-text-link">
        <img src="/images/home/logo-text.png" alt="Cuc Pet" className="logo-text-img" />
      </Link>
    </div>
  );
}

export default NavLogo;
