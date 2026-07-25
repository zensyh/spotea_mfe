import { NextResponse } from 'next/server';
import { loginSchema } from '@/features/auth/login/components/form/form-model/login.schema';
import { formatZodError } from '@/shared/lib/format-zod-validation';
import { extractCookie } from '@/shared/lib/cookie-utils';
import {
  createSession,
  DEVICE_ID_COOKIE,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
} from '@repo/auth';
import { buildDeviceHeaders } from '@/shared/lib/bff-auth';

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

    const cookieHeader = request.headers.get('cookie') || '';
    const existingDeviceId = extractCookie(cookieHeader, DEVICE_ID_COOKIE);
    const deviceId = existingDeviceId || crypto.randomUUID();
    const deviceCookieNeeded = !existingDeviceId;

    const headers = buildDeviceHeaders(request, deviceId);

    const res = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(parsed.data),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || 'Login failed.' },
        { status: res.status },
      );
    }

    const loginData = data.data;
    if (!loginData) {
      return NextResponse.json(
        { message: 'Internal server error.' },
        { status: 500 },
      );
    }

    const sid = crypto.randomUUID();
    const now = new Date().toISOString();
    const userName =
      loginData.user.name || loginData.user.username || 'User';

    await createSession(
      sid,
      {
        accessToken: loginData.access_token,
        refreshToken: loginData.refresh_token,
        userId: loginData.user.id,
        role: loginData.user.role,
        username: loginData.user.username,
        name: userName,
        createdAt: now,
      },
      REFRESH_TOKEN_EXPIRES_IN_SECONDS,
    );

    const clientResponse = NextResponse.json(
      {
        user: {
          id: loginData.user.id,
          name: userName,
          username: loginData.user.username,
          role: loginData.user.role,
        },
      },
      { status: 200 },
    );

    clientResponse.cookies.set('sid', sid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    if (deviceCookieNeeded) {
      clientResponse.cookies.set(DEVICE_ID_COOKIE, deviceId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
      });
    }

    return clientResponse;
  } catch {
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 },
    );
  }
}


