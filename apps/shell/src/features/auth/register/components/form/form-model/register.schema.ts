import { z } from 'zod';
import type { RegisterPayload } from '@repo/auth';

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Username is required.')
      .min(3, 'Username minimal 3 karakter')
      .max(30, 'Username maksimal 30 karakter')
      .regex(
        /^[a-z0-9._]+$/,
        'Hanya boleh huruf kecil a-z, angka 0-9, underscore (_), dan titik (.)',
      )
      .regex(/^(?!\d+$)/, 'Username tidak boleh hanya berisi angka')
      .regex(
        /^(?![._])/,
        'Username tidak boleh diawali dengan underscore atau titik',
      )
      .regex(
        /(?<![._])$/,
        'Username tidak boleh diakhiri dengan underscore atau titik',
      )
      .regex(
        /^(?!.*[._]{2})/,
        'Tidak boleh ada dua karakter khusus (._) berurutan',
      )
      .trim(),

    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),

    confirmPassword: z.string().nonoptional(),

    email: z
      .email('Invalid email address')
      .nonempty('Email is required')
      .trim()
      .toLowerCase(),

    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters')
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }) satisfies z.ZodType<RegisterPayload>;

export type RegisterFormValues = z.infer<typeof registerSchema>;
