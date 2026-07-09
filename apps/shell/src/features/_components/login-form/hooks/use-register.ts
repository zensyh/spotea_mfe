import { useState, useCallback } from 'react';
import type { User } from '@repo/auth';
import { fetcher, ApiError } from '@/shared/lib/fetcher';
import type { RegisterFormValues } from '../form-model/register.schema';

interface UseRegisterReturn {
  register: (payload: RegisterFormValues) => Promise<User | null>;
  loading: boolean;
  error: string | null;
}

export function useRegister(): UseRegisterReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (payload: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetcher<{ user: User }>('/api/auth/register', {
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

  return { register, loading, error };
}
