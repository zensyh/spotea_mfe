import { NextResponse } from 'next/server';
import { extractCookie } from '@/shared/lib/cookie-utils';
import { parseBody } from '@/shared/lib/body-utils';
import { getSessionData, authenticatedFetch, deleteUserSessions } from '@repo/auth';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost';

async function handlePasswordChange(sid: string, body: Record<string, unknown>) {
  const session = await getSessionData(sid);
  if (!session) {
    return NextResponse.json({ message: 'Session expired' }, { status: 401 });
  }

  const res = await authenticatedFetch(sid, '/profile/password', {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (res.ok) {
    await deleteUserSessions(session.userId);
    const response = NextResponse.redirect(new URL('/login', APP_URL));
    response.cookies.set('sid', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });
    return response;
  }

  return NextResponse.json(data, { status: res.status });
}

export async function PUT(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sid = extractCookie(cookieHeader, 'sid');
    if (!sid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await parseBody(request);
    return await handlePasswordChange(sid, body);
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sid = extractCookie(cookieHeader, 'sid');
    if (!sid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await parseBody(request);
    return await handlePasswordChange(sid, body);
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
