import axiosClient from './axiosClient';

export async function getCart() {
  const { data } = await axiosClient.get('/cart');
  return data.data;
}

export async function addToCart(productId, quantity = 1) {
  const { data } = await axiosClient.post('/cart/items', { productId, quantity });
  return data.data;
}

export async function updateCartItemQuantity(productId, quantity) {
  const { data } = await axiosClient.put(`/cart/items/${productId}`, { quantity });
  return data.data;
}

export async function removeCartItem(productId) {
  const { data } = await axiosClient.delete(`/cart/items/${productId}`);
  return data.data;
}

export async function clearCart() {
  const { data } = await axiosClient.delete('/cart');
  return data.data;
}
