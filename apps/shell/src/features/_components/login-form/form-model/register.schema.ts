import { z } from 'zod';
import type { RegisterPayload } from '@repo/auth';

export const registerSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(20, 'Username maksimal 20 karakter')
    .regex(/^[a-z0-9_]+$/, 'Hanya huruf kecil, angka, dan underscore'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  phone: z
    .string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .optional()
    .or(z.literal('')),
}) satisfies z.ZodType<RegisterPayload>;

export type RegisterFormValues = z.infer<typeof registerSchema>;
