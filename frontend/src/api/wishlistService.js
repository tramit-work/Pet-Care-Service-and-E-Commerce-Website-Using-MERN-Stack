import axiosClient from './axiosClient';

export async function getWishlist() {
  const { data } = await axiosClient.get('/wishlist');
  return data.data;
}

export async function addToWishlist(productId) {
  const { data } = await axiosClient.post('/wishlist', { product: productId });
  return data.data;
}

export async function removeFromWishlist(productId) {
  const { data } = await axiosClient.delete(`/wishlist/${productId}`);
  return data;
}
