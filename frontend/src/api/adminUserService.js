import adminAxiosClient from './adminAxiosClient';

export async function getAdminUsers(params = {}) {
  const { data } = await adminAxiosClient.get('/admin/users', { params });
  return { items: data.data || [], pagination: data.pagination };
}

export async function getAdminUserDetail(id) {
  const { data } = await adminAxiosClient.get(`/admin/users/${id}`);
  return data.data;
}

export async function updateUserRole(id, role) {
  const { data } = await adminAxiosClient.put(`/admin/users/${id}/role`, { role });
  return data.data;
}

export async function updateUserStatus(id, isActive) {
  const { data } = await adminAxiosClient.put(`/admin/users/${id}/status`, { isActive });
  return data.data;
}
