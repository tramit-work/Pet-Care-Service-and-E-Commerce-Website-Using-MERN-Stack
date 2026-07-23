import adminAxiosClient from './adminAxiosClient';
import { RECORD_STATUS } from '../utils/adminConstants';

export async function getAdminProducts(params = {}) {
  const { data } = await adminAxiosClient.get('/products', { params });
  return { items: data.data || [], pagination: data.pagination };
}

export async function getAdminProductById(id) {
  const { data } = await adminAxiosClient.get(`/products/${id}`);
  return data.data;
}

export async function createProduct(payload) {
  const { data } = await adminAxiosClient.post('/products', payload);
  return data.data;
}

export async function updateProduct(id, payload) {
  const { data } = await adminAxiosClient.put(`/products/${id}`, payload);
  return data.data;
}

export async function softDeleteProduct(id) {
  const { data } = await adminAxiosClient.put(`/products/${id}`, { status: RECORD_STATUS.INACTIVE });
  return data.data;
}
