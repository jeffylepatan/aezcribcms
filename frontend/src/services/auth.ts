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

// Log outgoing requests (mask token) to help debug Authorization issues
api.interceptors.request.use((config) => {
  try {
    const headerAuth = config.headers?.Authorization ?? api.defaults.headers.common['Authorization'];
    let masked = 'NONE';
    if (headerAuth) {
      const s = String(headerAuth);
      if (s.toLowerCase().startsWith('bearer ')) {
        masked = 'Bearer ' + s.slice(7, 15) + '...';
      } else {
        masked = s.slice(0, 8) + '...';
      }
    }
    // Use console.log so messages are visible by default in browser consoles
    console.log('API Request ->', { method: config.method, url: config.url, hasToken: !!headerAuth, token: masked });
  } catch (e) {
    // ignore logging errors
  }
  return config;
}, (error) => Promise.reject(error));

// Handle errors
api.interceptors.response.use(
  (response) => {
    try {
      console.log('API Response <-', { url: response.config?.url, status: response.status });
    } catch (e) {}
    return response;
  },
  async (error) => {
    try {
      console.error('API Error <-', { url: error.config?.url, status: error.response?.status, data: error.response?.data });
    } catch (e) {}
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
      // Ensure axios sends Authorization header for subsequent requests
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
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
      // Ensure axios sends Authorization header for subsequent requests
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
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
      // Remove Authorization header from axios defaults to avoid sending stale token
      try {
        delete api.defaults.headers.common['Authorization'];
      } catch (e) {
        // ignore
      }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      // If we have a stored token, attach it to the request so session-based or token-based
      // auth endpoints that expect Authorization header will accept the request.
      const token = this.getToken();
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      console.log('Fetching current user with token:', token ? token.substring(0, 8) + '...' : 'NONE');
      // Also log axios default Authorization header to confirm what's actually being sent
      try {
        console.log('axios default Authorization header:', api.defaults.headers.common['Authorization'] ?? 'NONE');
      } catch (e) {}

      const response = await api.get<{ user: User }>('/api/auth/me');
      const user = response.data.user;
      // Map custom fields from Drupal
      const mappedUser = {
        ...user,
        firstName: user.field_first_name || user.firstName,
        lastName: user.field_last_name || user.lastName,
      };
      localStorage.setItem(this.USER_KEY, JSON.stringify(mappedUser));
      // Ensure header is present after successful fetch
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      return mappedUser;
    } catch (error: any) {
      // Only clear stored credentials for explicit unauthenticated (401) responses.
      // Some backends return 403 for permission errors while the token is still valid,
      // so avoid removing the token on 403 to prevent accidental logout after actions
      // like purchases that briefly change permissions.
      const status = error?.response?.status;
      if (status === 401) {
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
        try {
          delete api.defaults.headers.common['Authorization'];
        } catch (e) {
          // ignore
        }
        return null;
      }

      // For 403 or other non-401 errors, keep the token in storage and just return null.
      console.warn('getCurrentUser failed with status', status, "- keeping stored token");
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