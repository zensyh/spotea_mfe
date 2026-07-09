import { useState, useCallback } from 'react';
import type { User } from '@repo/auth';
import { fetcher, ApiError } from '@/shared/lib/fetcher';
import type { LoginFormValues } from '../form-model/login.schema';

interface UseLoginReturn {
  login: (payload: LoginFormValues) => Promise<User | null>;
  loading: boolean;
  error: string | null;
}

export function useLogin(): UseLoginReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (payload: LoginFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetcher<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: payload,
      });
      return data.user;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Terjadi kesalahan';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error };
}
