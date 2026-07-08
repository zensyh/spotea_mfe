import { z } from 'zod';
import type { LoginPayload } from '@spotea/auth';

export const loginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
}) satisfies z.ZodType<LoginPayload>;

export type LoginFormValues = z.infer<typeof loginSchema>;
