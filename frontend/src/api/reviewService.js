import axiosClient from './axiosClient';

export async function getMyReviewForOrder(orderId, productId) {
  const { data } = await axiosClient.get('/reviews', { params: { product: productId, order: orderId, limit: 1 } });
  return data.data?.[0] || null;
}

export async function getProductReviews(productId, params = {}) {
  const { data } = await axiosClient.get('/reviews', { params: { product: productId, ...params } });
  return { items: data.data || [], summary: data.summary, pagination: data.pagination };
}

export async function createReview(payload) {
  const { data } = await axiosClient.post('/reviews', payload);
  return data.data;
}

export async function updateReview(id, payload) {
  const { data } = await axiosClient.put(`/reviews/${id}`, payload);
  return data.data;
}
