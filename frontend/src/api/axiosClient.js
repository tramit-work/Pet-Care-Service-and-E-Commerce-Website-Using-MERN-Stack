import axios from 'axios';

const TOKEN_KEY = 'petcare_token';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;

function clearSessionAndNotify() {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event('auth:unauthorized'));
}

// Endpoint tự thân KHÔNG được thử refresh khi 401 (tránh vòng lặp vô hạn
// hoặc refresh nhầm lúc chính /login hay /refresh trả lỗi).
const NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/admin-login'];

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response || response.status !== 401 || !config) {
      return Promise.reject(error);
    }

    const isNoRefreshPath = NO_REFRESH_PATHS.some((p) => config.url?.includes(p));
    if (isNoRefreshPath || config._retry) {
      if (!isNoRefreshPath) clearSessionAndNotify();
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axiosClient.post('/auth/refresh').finally(() => {
          refreshPromise = null;
        });
      }
      const { data } = await refreshPromise;
      localStorage.setItem(TOKEN_KEY, data.token);
      config.headers.Authorization = `Bearer ${data.token}`;
      return axiosClient(config);
    } catch (refreshError) {
      clearSessionAndNotify();
      return Promise.reject(error);
    }
  }
);

export default axiosClient;
