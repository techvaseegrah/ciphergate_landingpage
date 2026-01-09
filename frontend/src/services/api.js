import axios from 'axios';
import { getAuthToken } from '../utils/authUtils';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // https://task-tracker-backend-1-r8os.onrender.com/api
  // 'http://localhost:5000/api',
  withCredentials: true, // If you need cookies for CORS, otherwise can remove
});

// Request interceptor: adds token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    console.log('API Request - Token being sent:', token); // Enhanced debug log
    console.log('API Request - Full config:', config.url); // Log the URL being called
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.error('API Request - No token found for request to:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('API Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: handles 401 unauthorized
api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data, error.config?.url);
    if (error.response && error.response.status === 401) {
      console.error('API 401 Unauthorized access');
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Check if user is on a worker, client, or admin page to redirect appropriately
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/worker')) {
        // For worker routes, we don't want to redirect to admin login
        // The component should handle the error display
        console.log('Worker authentication failed, staying on current page');
      } else if (currentPath.startsWith('/client')) {
        // For client routes, we don't want to redirect to admin login
        // The component should handle the error display
        console.log('Client authentication failed, staying on current page');
      } else if (!currentPath.startsWith('/admin/login') && !currentPath.startsWith('/admin/register')) {
        // For other admin routes (not login/register), redirect to admin login
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;