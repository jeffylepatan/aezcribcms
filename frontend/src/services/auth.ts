import axios from 'axios';
import Cookies from 'js-cookie';
import type { User, LoginCredentials, RegisterData, AuthResponse, ApiError } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aezcrib.xyz/app';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh or logout
      Cookies.remove('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';

  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      const { user, token } = response.data;
      
      // Store token and user data
      Cookies.set(this.TOKEN_KEY, token, { expires: 7, secure: true, sameSite: 'strict' });
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async register(data: RegisterData): Promise<User> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', data);
      const { user, token } = response.data;
      
      // Auto-login after registration
      Cookies.set(this.TOKEN_KEY, token, { expires: 7, secure: true, sameSite: 'strict' });
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      Cookies.remove(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = Cookies.get(this.TOKEN_KEY);
      if (!token) return null;

      const response = await api.get<{ user: User }>('/api/auth/me');
      const user = response.data.user;
      
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  static getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return !!Cookies.get(this.TOKEN_KEY);
  }

  private static handleError(error: any): ApiError {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      message: error.message || 'An unexpected error occurred',
    };
  }
}

export { api };