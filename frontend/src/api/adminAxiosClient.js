import axios from 'axios';

const adminAxiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

adminAxiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('petcare_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminAxiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('petcare_admin_token');
      window.dispatchEvent(new Event('admin-auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default adminAxiosClient;
