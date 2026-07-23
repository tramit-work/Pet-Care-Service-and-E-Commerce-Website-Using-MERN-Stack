import adminAxiosClient from './adminAxiosClient';

export async function getAdminCategories({ status } = {}) {
  if (status) {
    const { data } = await adminAxiosClient.get('/categories', { params: { status } });
    return data.data || [];
  }

  const [activeRes, inactiveRes] = await Promise.all([
    adminAxiosClient.get('/categories', { params: { status: 'active' } }),
    adminAxiosClient.get('/categories', { params: { status: 'inactive' } }),
  ]);

  return [...(activeRes.data.data || []), ...(inactiveRes.data.data || [])];
}

export async function getAdminCategoryById(id) {
  const { data } = await adminAxiosClient.get(`/categories/${id}`);
  return data.data;
}

export async function createCategory(payload) {
  const { data } = await adminAxiosClient.post('/categories', payload);
  return data.data;
}

export async function updateCategory(id, payload) {
  const { data } = await adminAxiosClient.put(`/categories/${id}`, payload);
  return data.data;
}

/**
 * Xóa hẳn (đúng theo backend/controllers/category.controller.js) — Backend
 * tự chặn (409) nếu còn Product tham chiếu, message lỗi trả thẳng lên
 * cho Toast hiển thị, không cần Frontend tự đếm trước.
 */
export async function deleteCategory(id) {
  const { data } = await adminAxiosClient.delete(`/categories/${id}`);
  return data;
}
