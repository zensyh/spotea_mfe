import { z } from 'zod';
import type { LoginPayload } from '@repo/auth';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
}) satisfies z.ZodType<LoginPayload>;

export type LoginFormValues = z.infer<typeof loginSchema>;
