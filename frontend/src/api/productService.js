import axiosClient from './axiosClient';
import { formatPrice } from '../utils/formatPrice';

function mapProductFromApi(product) {
  const categoryKey =
    product.category && typeof product.category === 'object' ? product.category.slug : product.category;
  const categoryName =
    product.category && typeof product.category === 'object' ? product.category.name : null;

  return {
    id: product._id,
    category: categoryKey,
    categoryName,
    brand: product.brand || '',
    name: product.name,
    image: product.image,
    alt: product.name,
    price: formatPrice(product.price),
    priceValue: product.price,
    originalPrice: product.originalPrice ? formatPrice(product.originalPrice) : null,
    isNew: Boolean(product.isNewArrival),
    isSale: Boolean(product.isSale),
    rating: product.rating || 0,
    numReviews: product.numReviews || 0,
    stock: product.stock ?? 0,
    quickDescription: product.description || '',
  };
}

export async function getProducts(params = {}) {
  const { data } = await axiosClient.get('/products', { params: { limit: 200, ...params } });
  return {
    items: (data.data || []).map(mapProductFromApi),
    pagination: data.pagination,
  };
}

export async function getProductById(id) {
  const { data } = await axiosClient.get(`/products/${id}`);
  return mapProductFromApi(data.data);
}

export async function createProduct(payload) {
  const { data } = await axiosClient.post('/products', payload);
  return mapProductFromApi(data.data);
}

export async function updateProduct(id, payload) {
  const { data } = await axiosClient.put(`/products/${id}`, payload);
  return mapProductFromApi(data.data);
}

export async function deleteProduct(id) {
  const { data } = await axiosClient.delete(`/products/${id}`);
  return data;
}
