import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function useAddToCartFeedback(showSnackbar) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  async function handleAddToCart(productId, quantity = 1, options = {}) {
    const result = await addToCart(productId, quantity);

    if (!result.success && result.reason === 'unauthenticated') {
      showSnackbar('Vui lòng đăng nhập để thêm vào giỏ hàng.');
      setTimeout(() => {
        navigate('/login', { state: { from: options.from || '/shopping' } });
      }, 1200);
      return result;
    }

    if (!result.success) {
  
      const message = result.error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      showSnackbar(message);
      return result;
    }

    showSnackbar(options.successMessage || 'Đã thêm vào giỏ hàng!');
    return result;
  }

  return { handleAddToCart };
}
