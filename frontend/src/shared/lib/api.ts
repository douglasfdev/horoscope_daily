import axios from 'axios';
import type { Profile, Horoscope, User, ZodiacSign } from '@/types/auth';

/**
 * API Client with Axios
 * Configured with interceptors for authentication
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds Keycloak token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    
    // Token expired - try refresh
    if (response?.status === 401 && !config._retry) {
      config._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken });
          localStorage.setItem('access_token', data.accessToken);
          localStorage.setItem('refresh_token', data.refreshToken);
          
          // Retry original request
          return api.request(config);
        } catch (refreshError) {
          // Refresh failed - logout user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================================================
// Auth API
// ============================================================================

export const authApi = {
  /** Get current user from Keycloak */
  get_me: () => api.get<User>('/auth/me'),
  
  /** Logout user */
  logout: () => api.post('/auth/logout'),
};

// ============================================================================
// Profile API
// ============================================================================

export const profileApi = {
  /** Get user profile */
  get: () => api.get<Profile>('/api/profile'),
  
  /** Create or update profile */
  create: (data: { birthDate: string; phone?: string | null }) =>
    api.post<Profile>('/api/profile', data),
  
  /** Update profile */
  update: (data: Partial<Profile>) => api.put<Profile>('/api/profile', data),
};

// ============================================================================
// Horoscope API
// ============================================================================

export const horoscopeApi = {
  /** Get daily horoscope for a sign */
  getDaily: (sign: ZodiacSign, lang: string = 'pt', date?: string) =>
    api.get<Horoscope>('/v1/horoscope/daily', {
      params: { sign, lang, date },
    }),
};

export default api;