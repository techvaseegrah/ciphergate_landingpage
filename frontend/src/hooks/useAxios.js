import { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Remove the interceptors from the exported function to avoid multiple registrations
// Instead, just export the base API instance that can be used with auth context
const requestInterceptor = api.interceptors.request.use(
  (config) => {
    // Prioritize context token, fallback to localStorage
    const token = localStorage.getItem('token'); // Use localStorage directly for consistency

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request Token:', token);
    } else {
      console.warn('No token available for request');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const responseInterceptor = api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information
    console.error('API Error:', error);

    if (error.response) {
      console.error('Error Response:', error.response.data);
      console.error('Error Status:', error.response.status);

      // Automatically logout on 401 (Unauthorized) errors
      if (error.response.status === 401) {
        console.warn('Unauthorized: Logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't call logout() here to avoid circular dependency
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

export const useAxios = () => {
  const { user, logout } = useAuth();

  // This hook is primarily used to provide access to the configured API instance
  // The interceptors are already set up globally above
  return api;
};

export default api;