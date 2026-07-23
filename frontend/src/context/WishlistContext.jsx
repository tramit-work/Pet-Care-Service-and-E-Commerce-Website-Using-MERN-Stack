import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { getWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../api/wishlistService';

const WishlistContext = createContext(null);

/**
 * Provider quản lý TOÀN BỘ state Wishlist toàn app — lý do cần Context
 * riêng (không chỉ dùng state cục bộ ở ShoppingPage): nút tim nằm trong
 * ProductCard (Shopping) còn Badge số lượng nằm ở Navbar (Layout dùng
 * chung mọi trang) — 2 nơi này không có quan hệ cha-con, cần state dùng
 * chung để Badge cập nhật "realtime" ngay khi bấm tim, giống cách
 * AuthContext giải quyết vấn đề tương tự cho trạng thái đăng nhập.
 *
 * ProductCard/ProductGrid KHÔNG gọi API — chỉ nhận `isInWishlist`/
 * `toggleWishlist` qua props/context, giữ đúng vai trò UI thuần.
 *
 * `toggleWishlist` KHÔNG tự hiện thông báo/điều hướng khi chưa đăng nhập —
 * trả về `{ success:false, reason:'unauthenticated' }` để trang gọi
 * (ShoppingPage) tự quyết định hiện Snackbar + điều hướng, đúng pattern đã
 * dùng cho Booking ở ServicePage (context không phụ thuộc UI feedback).
 */
export function WishlistProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [productIds, setProductIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  /**
   * Phụ thuộc CẢ `authLoading` lẫn `isAuthenticated`:
   * - F5 với session cũ: AuthContext đang xác thực lại token (authLoading
   *   = true) — đợi xác thực xong mới quyết định fetch, tránh chớp trạng
   *   thái "chưa đăng nhập" sai trong lúc đang khôi phục phiên.
   * - Login: isAuthenticated false -> true, effect chạy lại, fetch.
   * - Logout: isAuthenticated true -> false, xóa sạch state (Badge về 0).
   */
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setProductIds(new Set());
      return;
    }

    let cancelled = false;

    async function loadWishlist() {
      setLoading(true);
      try {
        const items = await getWishlist();
        if (cancelled) return;
        const ids = items.map((item) => (item.product?._id ? String(item.product._id) : String(item.product)));
        setProductIds(new Set(ids));
      } catch (err) {
        // Lỗi tải wishlist ban đầu (mất mạng...) — im lặng bỏ qua, không
        // chặn trang hiển thị; Badge chỉ đơn giản hiện 0 cho tới lần fetch
        // sau thành công.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWishlist();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading]);

  function isInWishlist(productId) {
    return productIds.has(String(productId));
  }

  /**
   * Toggle idempotent phía UI: cập nhật state cục bộ lạc quan (optimistic)
   * SAU KHI API xác nhận thành công — không cập nhật trước để tránh Badge
   * hiện sai nếu API lỗi.
   */
  async function toggleWishlist(productId) {
    if (!isAuthenticated) {
      return { success: false, reason: 'unauthenticated' };
    }

    const key = String(productId);
    const currentlyIn = productIds.has(key);

    try {
      if (currentlyIn) {
        await apiRemoveFromWishlist(productId);
        setProductIds((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        await apiAddToWishlist(productId);
        setProductIds((prev) => new Set(prev).add(key));
      }
      return { success: true, added: !currentlyIn };
    } catch (err) {
      return { success: false, reason: 'error', error: err };
    }
  }

  const value = useMemo(
    () => ({
      isInWishlist,
      toggleWishlist,
      wishlistCount: productIds.size,
      loading,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productIds, loading, isAuthenticated]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist phải được dùng bên trong WishlistProvider');
  }
  return context;
}
