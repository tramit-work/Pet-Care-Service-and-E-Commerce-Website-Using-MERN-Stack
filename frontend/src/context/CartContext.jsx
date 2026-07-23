import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import * as cartService from '../api/cartService';

const CartContext = createContext(null);

/**
 * Provider quản lý TOÀN BỘ state Cart toàn app — cùng lý do kiến trúc như
 * WishlistContext (Step 14A): nút "Thêm vào giỏ hàng" nằm trong ProductCard
 * (Shopping) còn Badge số lượng nằm ở Navbar (Layout dùng chung mọi trang),
 * 2 nơi không có quan hệ cha-con, cần state dùng chung để Badge cập nhật
 * "realtime".
 *
 * Các hàm mutate (addToCart/updateQuantity/removeItem/clearCart) đều
 * KHÔNG tự hiện thông báo/điều hướng — trả về `{success, reason}` để trang
 * gọi tự quyết định UI feedback, đúng pattern đã dùng cho Booking/Wishlist.
 */
export function CartProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [count, setCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  function applyCartData(cart) {
    setCartItems(cart?.items || []);
    setCount(cart?.totalQuantity || 0);
    setSubtotal(cart?.totalAmount || 0);
  }

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setCount(0);
      setSubtotal(0);
      return;
    }

    setLoading(true);
    try {
      const cart = await cartService.getCart();
      applyCartData(cart);
    } catch (err) {
      // Lỗi tải giỏ hàng ban đầu (mất mạng...) — im lặng bỏ qua, không chặn
      // trang hiển thị, cùng cách xử lý đã dùng cho WishlistContext.
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Phụ thuộc CẢ authLoading lẫn isAuthenticated — đợi AuthContext xác thực
  // xong (F5/session restore) mới quyết định load, tránh chớp sai trạng thái.
  useEffect(() => {
    if (authLoading) return;
    loadCart();
  }, [authLoading, isAuthenticated, loadCart]);

  async function addToCart(productId, quantity = 1) {
    if (!isAuthenticated) {
      return { success: false, reason: 'unauthenticated' };
    }
    try {
      const cart = await cartService.addToCart(productId, quantity);
      applyCartData(cart);
      return { success: true };
    } catch (err) {
      return { success: false, reason: 'error', error: err };
    }
  }

  async function updateQuantity(productId, quantity) {
    try {
      const cart = await cartService.updateCartItemQuantity(productId, quantity);
      applyCartData(cart);
      return { success: true };
    } catch (err) {
      return { success: false, reason: 'error', error: err };
    }
  }

  async function removeItem(productId) {
    try {
      const cart = await cartService.removeCartItem(productId);
      applyCartData(cart);
      return { success: true };
    } catch (err) {
      return { success: false, reason: 'error', error: err };
    }
  }

  async function clearCart() {
    try {
      const cart = await cartService.clearCart();
      applyCartData(cart);
      return { success: true };
    } catch (err) {
      return { success: false, reason: 'error', error: err };
    }
  }

  const value = useMemo(
    () => ({ cartItems, count, subtotal, loading, loadCart, addToCart, updateQuantity, removeItem, clearCart }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cartItems, count, subtotal, loading, isAuthenticated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được dùng bên trong CartProvider');
  }
  return context;
}
