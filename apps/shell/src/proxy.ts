import { NextResponse, type NextRequest } from 'next/server';
import { DEVICE_ID_COOKIE } from '@repo/auth';

export function proxy(request: NextRequest) {
  const hasDeviceId = Boolean(request.cookies.get(DEVICE_ID_COOKIE)?.value);

  if (!hasDeviceId) {
    const response = NextResponse.next();
    response.cookies.set(DEVICE_ID_COOKIE, crypto.randomUUID(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
