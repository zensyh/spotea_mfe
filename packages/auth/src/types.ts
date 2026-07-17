export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN';
}

export interface Session {
  user: User;
  token: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
