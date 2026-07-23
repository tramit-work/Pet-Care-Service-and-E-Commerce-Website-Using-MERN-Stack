import adminAxiosClient from './adminAxiosClient';

export async function getAdminPets(params = {}) {
  const { data } = await adminAxiosClient.get('/pets', { params });
  return { items: data.data || [], pagination: data.pagination };
}

export async function getAdminPetById(id) {
  const { data } = await adminAxiosClient.get(`/pets/${id}`);
  return data.data;
}

export async function createPet(payload) {
  const { data } = await adminAxiosClient.post('/pets', payload);
  return data.data;
}

export async function updatePet(id, payload) {
  const { data } = await adminAxiosClient.put(`/pets/${id}`, payload);
  return data.data;
}

export async function deletePet(id) {
  const { data } = await adminAxiosClient.delete(`/pets/${id}`);
  return data;
}
