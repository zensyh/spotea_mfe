import { ZodError } from 'zod';

export const formatZodError = (error: ZodError): string => {
  const issue = error.issues?.[0];
  return issue?.message ?? 'Validasi gagal';
};
