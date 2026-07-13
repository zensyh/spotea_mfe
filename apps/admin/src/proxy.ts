import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_NAME } from '@repo/auth';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost';

export function proxy(request: NextRequest) {
  const hasToken = Boolean(request.cookies.get(COOKIE_NAME)?.value);

  if (!hasToken) {
    return NextResponse.redirect(new URL('/login', APP_URL));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
