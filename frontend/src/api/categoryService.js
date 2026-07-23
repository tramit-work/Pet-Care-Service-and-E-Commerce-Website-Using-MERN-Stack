import axiosClient from './axiosClient';

function mapCategoryToShapes(categories) {
  const collectionCards = categories.map((cat) => ({
    id: cat.slug,
    category: cat.slug,
    label: cat.name,
    image: cat.image,
    alt: cat.name,
  }));

  const categoryNavList = categories.map((cat) => ({
    label: cat.name,
    category: cat.slug,
  }));

  const subcategoryNavList = categoryNavList;

  return { collectionCards, categoryNavList, subcategoryNavList };
}

export async function getCategoriesForShopping() {
  const { data } = await axiosClient.get('/categories');
  return mapCategoryToShapes(data.data || []);
}

export async function getCategories() {
  const { data } = await axiosClient.get('/categories');
  return data.data;
}

export async function getCategoryById(id) {
  const { data } = await axiosClient.get(`/categories/${id}`);
  return data.data;
}

export async function createCategory(payload) {
  const { data } = await axiosClient.post('/categories', payload);
  return data.data;
}

export async function updateCategory(id, payload) {
  const { data } = await axiosClient.put(`/categories/${id}`, payload);
  return data.data;
}

export async function deleteCategory(id) {
  const { data } = await axiosClient.delete(`/categories/${id}`);
  return data;
}
