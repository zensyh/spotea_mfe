import { NextResponse } from 'next/server';
import { parseBody } from '@/shared/lib/body-utils';
import { requireSession, protectedFetch, deleteUserSessions, HttpError } from '@repo/auth';
import { handleApi } from '@/shared/lib/handle-api';

type RouteParams = { params: Promise<{ id: string }> };

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost';

export async function PATCH(request: Request, { params }: RouteParams) {
  return handleApi(async () => {
    const session = await requireSession();

    if (session.user.role !== 'ADMIN') {
      throw new HttpError(403, 'Forbidden');
    }

    const { id } = await params;
    const body = await parseBody(request);

    const res = await protectedFetch(session.token, `/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.ok) {
      await deleteUserSessions(id);
    }

    return NextResponse.json(data, { status: res.status });
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  return handleApi(async () => {
    const session = await requireSession();

    if (session.user.role !== 'ADMIN') {
      throw new HttpError(403, 'Forbidden');
    }

    const { id } = await params;
    const body = await parseBody(request);

    const res = await protectedFetch(session.token, `/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.ok) {
      await deleteUserSessions(id);
    }

    if (res.ok) {
      return NextResponse.redirect(
        new URL('/admin/sessions', APP_URL),
      );
    }

    return NextResponse.json(data, { status: res.status });
  });
}
