import adminAxiosClient from './adminAxiosClient';


export async function getAdminOrders(params = {}) {
  const { data } = await adminAxiosClient.get('/orders', { params });
  return { items: data.data || [], pagination: data.pagination };
}

export async function getAdminOrderById(id) {
  const { data } = await adminAxiosClient.get(`/orders/${id}`);
  return data.data;
}

export async function updateOrderStatus(id, status) {
  const { data } = await adminAxiosClient.put(`/orders/${id}/status`, { status });
  return data.data;
}

export async function cancelAdminOrder(id) {
  const { data } = await adminAxiosClient.put(`/orders/${id}/cancel`);
  return data.data;
}
