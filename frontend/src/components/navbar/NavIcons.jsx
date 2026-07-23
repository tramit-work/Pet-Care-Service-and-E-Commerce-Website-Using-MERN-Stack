import { Link } from 'react-router-dom';
import NavSearch from './NavSearch';
import NavAccountMenu from './NavAccountMenu';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

function NavIcons() {
  const { isAuthenticated } = useAuth();
  const { wishlistCount } = useWishlist();
  const { count: cartCount } = useCart();

  return (
    <div className="nav-icon">
      <NavSearch />
      {isAuthenticated ? (
        <NavAccountMenu />
      ) : (
        <Link to="/login" aria-label="Tài khoản">
          <i className="bx bx-user-circle"></i>
        </Link>
      )}
      <Link to="/wishlist" aria-label="Danh sách yêu thích" className="nav-wishlist-link">
        <i className="bx bx-heart"></i>
        {wishlistCount > 0 && <span className="nav-wishlist-badge">{wishlistCount}</span>}
      </Link>
      <Link to="/cart" aria-label="Giỏ hàng" className="nav-cart-link">
        <i className="bx bx-cart-alt"></i>
        {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
      </Link>
    </div>
  );
}

export default NavIcons;
