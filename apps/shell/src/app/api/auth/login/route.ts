import { NextResponse } from 'next/server';
import { loginSchema } from '@/features/auth/login/components/form/form-model/login.schema';
import { formatZodError } from '@/shared/lib/format-zod-validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { message: 'Internal server error.' },
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
        { message: data.message || 'Login failed.' },
        { status: res.status },
      );
    }

    const accessToken = res.headers.get('x-access-token');
    const backendCookies = res.headers.get('set-cookie');

    if (!accessToken || !backendCookies) {
      return NextResponse.json(
        { message: 'Internal server error.' },
        { status: 500 },
      );
    }

    const clientResponse = NextResponse.json(data, { status: 200 });

    clientResponse.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 5 * 60,
    });
    clientResponse.headers.append('Set-Cookie', backendCookies);

    return clientResponse;
  } catch {
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 },
    );
  }
}
