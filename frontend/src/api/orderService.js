import axiosClient from './axiosClient';

export async function createOrder(payload) {
  const { data } = await axiosClient.post('/orders', payload);
  return data.data;
}

export async function getMyOrders(params = {}) {
  const { data } = await axiosClient.get('/orders', { params });
  return { items: data.data, pagination: data.pagination };
}

export async function getOrderById(id) {
  const { data } = await axiosClient.get(`/orders/${id}`);
  return data.data;
}

export async function cancelOrder(id) {
  const { data } = await axiosClient.put(`/orders/${id}/cancel`);
  return data.data;
}
