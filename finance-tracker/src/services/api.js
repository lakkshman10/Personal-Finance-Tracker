import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
let accessToken = null;
let refreshPromise = null;

const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true, headers: { 'Content-Type': 'application/json' } });

export const setAccessToken = (token) => { accessToken = token || null; };
export const clearAccessToken = () => { accessToken = null; };

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = api.post('/auth/refresh-token').then((response) => {
      const token = response.data?.accessToken;
      if (!token) throw new Error('Refresh response did not contain an access token.');
      setAccessToken(token);
      return token;
    }).finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isAuthRequest = /\/auth\/(signin|signup|logout|refresh-token)/.test(requestUrl);

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        const token = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        localStorage.removeItem('user');
        window.location.replace('/signin');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
