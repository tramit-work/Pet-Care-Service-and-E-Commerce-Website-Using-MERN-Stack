import axiosClient from './axiosClient';

export async function getPets(params = {}) {
  const { data } = await axiosClient.get('/pets', { params });
  return { items: data.data, pagination: data.pagination };
}

export async function getPetById(id) {
  const { data } = await axiosClient.get(`/pets/${id}`);
  return data.data;
}

export async function createPet(payload) {
  const { data } = await axiosClient.post('/pets', payload);
  return data.data;
}

export async function updatePet(id, payload) {
  const { data } = await axiosClient.put(`/pets/${id}`, payload);
  return data.data;
}

export async function deletePet(id) {
  const { data } = await axiosClient.delete(`/pets/${id}`);
  return data;
}
