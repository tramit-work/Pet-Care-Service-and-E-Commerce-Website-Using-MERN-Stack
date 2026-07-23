import adminAxiosClient from './adminAxiosClient';

export async function getAdminReviews(params = {}) {
  const { data } = await adminAxiosClient.get('/reviews/admin', { params });
  return { items: data.data || [], pagination: data.pagination };
}

export async function getAdminReviewById(id) {
  const { data } = await adminAxiosClient.get(`/reviews/${id}`);
  return data.data;
}

export async function updateReviewStatus(id, status) {
  const { data } = await adminAxiosClient.put(`/reviews/${id}/status`, { status });
  return data.data;
}
