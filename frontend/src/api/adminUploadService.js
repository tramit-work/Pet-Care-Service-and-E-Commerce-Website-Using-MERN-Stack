import adminAxiosClient from './adminAxiosClient';

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await adminAxiosClient.post('/uploads/image', formData, {
    headers: { 'Content-Type': undefined },
  });
  return data.data.url;
}

export async function uploadImages(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const { data } = await adminAxiosClient.post('/uploads/images', formData, {
    headers: { 'Content-Type': undefined },
  });
  return data.data.urls;
}
