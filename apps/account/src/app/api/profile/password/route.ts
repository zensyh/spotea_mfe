import { NextResponse } from 'next/server';
import { parseBody } from '@/shared/lib/body-utils';
import { requireSession, protectedFetch, deleteUserSessions } from '@repo/auth';
import { handleApi } from '@/shared/lib/handle-api';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost';

async function handlePasswordChange(sid: string, userId: string, body: Record<string, unknown>) {
  const res = await protectedFetch(sid, '/profile/password', {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (res.ok) {
    await deleteUserSessions(userId);
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
  return handleApi(async () => {
    const session = await requireSession();
    const body = await parseBody(request);
    return await handlePasswordChange(session.token, session.user.id, body);
  });
}

export async function POST(request: Request) {
  return handleApi(async () => {
    const session = await requireSession();
    const body = await parseBody(request);
    return await handlePasswordChange(session.token, session.user.id, body);
  });
}
