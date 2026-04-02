import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Use Bracket notation to safely access headers object properties
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration or unauthorized errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If we get an unauthorized error, we can handle token refresh or redirect to login
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
         // Auto-logout user only if they are not on unprotected pages
         localStorage.removeItem('token');
         localStorage.removeItem('user');
         window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
