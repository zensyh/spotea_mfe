import { z } from 'zod';

export const signinBackendResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    user: z.object({
      id: z.string().uuid(),
      username: z.string(),
      role: z.enum(['CUSTOMER', 'MERCHANT', 'ADMIN']),
      isActive: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
    access_token: z.string(),
    refresh_token: z.string(),
  }),
});

export type SigninBackendResponse = z.infer<typeof signinBackendResponseSchema>;
