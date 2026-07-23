import axiosClient from './axiosClient';

export async function getBookings(params = {}) {
  const { data } = await axiosClient.get('/bookings', { params });
  return { items: data.data, pagination: data.pagination };
}

export async function getBookingById(id) {
  const { data } = await axiosClient.get(`/bookings/${id}`);
  return data.data;
}

export async function createBooking(payload) {
  const { data } = await axiosClient.post('/bookings', payload);
  return data.data;
}

export async function updateBooking(id, payload) {
  const { data } = await axiosClient.put(`/bookings/${id}`, payload);
  return data.data;
}

export async function deleteBooking(id) {
  const { data } = await axiosClient.delete(`/bookings/${id}`);
  return data;
}
