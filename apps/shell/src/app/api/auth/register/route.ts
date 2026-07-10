import { NextResponse } from 'next/server';
import { registerSchema } from '@/features/auth/register/form-model/register.schema';

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
      name: parsed.data.name,
      username: parsed.data.username,
      password: parsed.data.password,
      confirmPassword: parsed.data.confirmPassword,
    };
    if (parsed.data.email) payload.email = parsed.data.email;

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

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Terjadi kesalahan internal' },
      { status: 500 },
    );
  }
}
