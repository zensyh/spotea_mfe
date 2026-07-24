import { NextResponse } from 'next/server';
import { getSessionData, deleteSession } from '@repo/auth';

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sid = extractCookie(cookieHeader, 'sid');

    if (sid) {
      const session = await getSessionData(sid);
      if (session && BACKEND_API_URL) {
        await fetch(`${BACKEND_API_URL}/auth/revoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: session.refreshToken }),
        }).catch(() => {});
      }

      await deleteSession(sid);
    }

    const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost'));
    response.cookies.set('sid', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch {
    const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost'));
    response.cookies.set('sid', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });
    return response;
  }
}

function extractCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  if (!match) return null;
  return match[1] ?? null;
}
