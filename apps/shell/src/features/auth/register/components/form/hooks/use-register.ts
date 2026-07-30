import { useState, useCallback } from 'react';
import type { User } from '@repo/auth';
import { fetcher, ApiError } from '@/shared/lib/fetcher';
import type { RegisterFormValues } from '../form-model/register.schema';
import { useRouter } from 'next/navigation';

interface UseRegisterReturn {
  onSubmit: (values: RegisterFormValues) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useRegister(): UseRegisterReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const register = useCallback(async (payload: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetcher<{ data: { user: User } }>(
        '/api/auth/register',
        {
          method: 'POST',
          body: payload,
        },
      );
      return response.data;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Terjadi kesalahan';
      setError(message);
      setLoading(false);
      return null;
    }
  }, []);

  const onSubmit = async (values: RegisterFormValues) => {
    if (loading) return;
    const user = await register(values);

    if (user) {
      await router.push('/login?registered=1');
    }
  };

  return { onSubmit, loading, error };
}
