import axios from 'axios';
import type { User, LoginCredentials, RegisterData, AuthResponse, ApiError } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aezcrib.xyz/app';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session-based auth
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired, logout
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class AuthService {
  private static readonly USER_KEY = 'user_data';
  private static readonly TOKEN_KEY = 'auth_token';

  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      const { user, token } = response.data;
      // Map custom fields from Drupal
      const mappedUser = {
        ...user,
        firstName: user.field_first_name || user.firstName,
        lastName: user.field_last_name || user.lastName,
      };
      console.log('Login successful:', { mappedUser, token: token ? '***TOKEN***' : 'NO_TOKEN' });
      // Store user data and token
      localStorage.setItem(this.USER_KEY, JSON.stringify(mappedUser));
      localStorage.setItem(this.TOKEN_KEY, token);
      return mappedUser;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw this.handleError(error);
    }
  }

  static async register(data: RegisterData): Promise<User> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', data);
      const { user, token } = response.data;
      // Map custom fields from Drupal
      const mappedUser = {
        ...user,
        firstName: user.field_first_name || user.firstName,
        lastName: user.field_last_name || user.lastName,
      };
      // Auto-login after registration - store user data and token
      localStorage.setItem(this.USER_KEY, JSON.stringify(mappedUser));
      localStorage.setItem(this.TOKEN_KEY, token);
      return mappedUser;
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
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<{ user: User }>('/api/auth/me');
      const user = response.data.user;
      // Map custom fields from Drupal
      const mappedUser = {
        ...user,
        firstName: user.field_first_name || user.firstName,
        lastName: user.field_last_name || user.lastName,
      };
      localStorage.setItem(this.USER_KEY, JSON.stringify(mappedUser));
      return mappedUser;
    } catch (error) {
      localStorage.removeItem(this.USER_KEY);
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

  static getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    console.log('AuthService.getToken: Retrieved token:', token ? token.substring(0, 8) + '...' : 'NONE');
    return token;
  }

  static isAuthenticated(): boolean {
    return !!this.getStoredUser() && !!this.getToken();
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