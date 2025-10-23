export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  field_first_name?: string;
  field_last_name?: string;
  role: 'parent' | 'educator' | 'creator';
  subscription?: {
    type: string;
    active: boolean;
    expires_at?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'parent' | 'educator' | 'creator';
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}