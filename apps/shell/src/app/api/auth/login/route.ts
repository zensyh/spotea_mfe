import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSessionCookie, type LoginPayload } from '@repo/auth';

const loginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
}) satisfies z.ZodType<LoginPayload>;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

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

    const res = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || 'Login gagal' },
        { status: res.status },
      );
    }

    const { user, token } = data as { user: unknown; token: string };
    const cookie = createSessionCookie(token);

    const response = NextResponse.json({ user }, { status: 200 });
    response.cookies.set(cookie);

    return response;
  } catch {
    return NextResponse.json(
      { message: 'Terjadi kesalahan internal' },
      { status: 500 },
    );
  }
}
