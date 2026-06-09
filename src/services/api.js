import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/me')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('sessionLastActivity');
      localStorage.removeItem('sessionExpired');
      sessionStorage.removeItem('sessionExpired');

      if (!isRedirecting) {
        isRedirecting = true;
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
