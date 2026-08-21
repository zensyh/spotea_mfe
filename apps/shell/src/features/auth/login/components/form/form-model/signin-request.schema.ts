import { z } from 'zod';

export const signinRequestSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type SigninFormValues = z.infer<typeof signinRequestSchema>;
