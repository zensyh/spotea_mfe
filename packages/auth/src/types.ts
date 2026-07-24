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

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN';
  username: string;
  name: string;
  createdAt: string;
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

export interface LoginApiResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      username: string;
      role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN';
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    access_token: string;
    refresh_token: string;
  };
}

export interface ApiError {
  message: string;
  status?: number;
}
