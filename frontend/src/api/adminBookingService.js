import adminAxiosClient from './adminAxiosClient';


export async function getAdminBookings(params = {}) {
  const { data } = await adminAxiosClient.get('/bookings', { params });
  return { items: data.data || [], pagination: data.pagination };
}

export async function getAdminBookingById(id) {
  const { data } = await adminAxiosClient.get(`/bookings/${id}`);
  return data.data;
}

export async function updateBooking(id, payload) {
  const { data } = await adminAxiosClient.put(`/bookings/${id}`, payload);
  return data.data;
}

export async function deleteBooking(id) {
  const { data } = await adminAxiosClient.delete(`/bookings/${id}`);
  return data;
}
