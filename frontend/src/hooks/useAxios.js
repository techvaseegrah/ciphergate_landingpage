import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// List of routes that don't need a token (to suppress warnings)
const publicRoutes = ['/auth/admin/subdomain-available', '/login', '/signup'];

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Only warn if the route is NOT in the publicRoutes list
      const isPublic = publicRoutes.some(route => config.url.includes(route));
      if (!isPublic) {
        console.warn(`No token available for protected request: ${config.url}`);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Automatically logout on 401 (Unauthorized) errors
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Prevent redirect loop if already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const useAxios = () => {
  // You can still keep the hook to access context if needed later
  return api;
};

export default api;
