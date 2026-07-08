export interface User {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  role: 'customer' | 'merchant' | 'admin';
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
  fullName: string;
  username: string;
  password: string;
  email?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
