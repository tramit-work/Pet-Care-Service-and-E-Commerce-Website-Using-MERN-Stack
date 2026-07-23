import axiosClient from './axiosClient';

export async function changePassword(currentPassword, newPassword) {
  const { data } = await axiosClient.put('/auth/change-password', { currentPassword, newPassword });
  return data.message;
}

export async function updateProfile(payload) {
  const { data } = await axiosClient.put('/auth/profile', payload);
  return data.user;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await axiosClient.post('/uploads/avatar', formData, {
    headers: { 'Content-Type': undefined },
  });
  return data.data.url;
}

export async function getSessions() {
  const { data } = await axiosClient.get('/auth/sessions');
  return data.data;
}

export async function revokeSession(sessionId) {
  const { data } = await axiosClient.delete(`/auth/sessions/${sessionId}`);
  return data.message;
}

export async function revokeAllSessions() {
  const { data } = await axiosClient.delete('/auth/sessions');
  return data.message;
}
