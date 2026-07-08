import { create } from 'zustand';
import type { User } from '@spotea/auth';
import { fetcher, ApiError } from './fetcher';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetcher<{ user: User }>('/api/auth/me');
      set({ user: data.user, loading: false });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Gagal mengambil data user';
      set({ error: message, loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await fetcher('/api/auth/logout', { method: 'POST' });
      set({ user: null, loading: false });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Gagal logout';
      set({ error: message, loading: false });
    }
  },
}));
