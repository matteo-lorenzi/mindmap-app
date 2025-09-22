import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { token });
          const newToken = response.data.token;
          localStorage.setItem('token', newToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async (): Promise<{ user: User }> => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const refreshToken = async (): Promise<{ token: string }> => {
  const token = localStorage.getItem('token');
  const response = await apiClient.post('/auth/refresh', { token });
  return response.data;
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('token');
  // Could also call a logout endpoint if needed
};

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Export the configured axios instance for use in other services
export { apiClient };