import type { AxiosResponse } from 'axios';
import axios from 'axios';

import { useToken } from '../hooks/use-token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useToken.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      useToken.getState().saveToken(null);

      // window.location.href = '/auth/sign-in'

      return Promise.reject(error);
    }

    if (error.response?.status >= 500) {
      console.error('Error fetching data:', error.response.data);
    }

    return Promise.reject(error);
  },
);

export default api;
