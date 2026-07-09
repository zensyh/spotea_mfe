import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSessionCookie, type RegisterPayload } from '@repo/auth';

const registerSchema = z.object({
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: 'Validasi gagal',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { message: 'Server tidak dikonfigurasi dengan benar' },
        { status: 500 },
      );
    }

    const payload: Record<string, unknown> = {
      fullName: parsed.data.fullName,
      username: parsed.data.username,
      password: parsed.data.password,
    };
    if (parsed.data.email) payload.email = parsed.data.email;
    if (parsed.data.phone) payload.phone = parsed.data.phone;

    const res = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || 'Registrasi gagal' },
        { status: res.status },
      );
    }

    const { user, token } = data as { user: unknown; token: string };
    const cookie = createSessionCookie(token);

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(cookie);

    return response;
  } catch {
    return NextResponse.json(
      { message: 'Terjadi kesalahan internal' },
      { status: 500 },
    );
  }
}
