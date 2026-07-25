import { NextResponse } from 'next/server';
import { extractCookie } from '@/shared/lib/cookie-utils';
import { parseBody } from '@/shared/lib/body-utils';
import { getSessionData, authenticatedFetch, deleteUserSessions } from '@repo/auth';

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sid = extractCookie(cookieHeader, 'sid');
    if (!sid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const adminSession = await getSessionData(sid);
    if (!adminSession || adminSession.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await parseBody(request);

    const res = await authenticatedFetch(sid, `/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.ok) {
      await deleteUserSessions(id);
    }

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sid = extractCookie(cookieHeader, 'sid');
    if (!sid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const adminSession = await getSessionData(sid);
    if (!adminSession || adminSession.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await parseBody(request);

    const res = await authenticatedFetch(sid, `/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.ok) {
      await deleteUserSessions(id);
    }

    if (res.ok) {
      return NextResponse.redirect(
        new URL('/admin/sessions', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost'),
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
