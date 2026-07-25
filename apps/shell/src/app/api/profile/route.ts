import { NextResponse } from 'next/server';
import { extractCookie } from '@/shared/lib/cookie-utils';
import { parseBody } from '@/shared/lib/body-utils';
import { authenticatedFetch, updateSession } from '@repo/auth';

async function handleProfileUpdate(sid: string, body: Record<string, unknown>) {
  const res = await authenticatedFetch(sid, '/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (res.ok && data.data) {
    const updateFields: Record<string, string | undefined> = {};
    if (data.data.name !== undefined) updateFields.name = data.data.name;
    await updateSession(sid, updateFields);
  }

  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sid = extractCookie(cookieHeader, 'sid');
    if (!sid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await parseBody(request);
    return await handleProfileUpdate(sid, body);
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
    return await handleProfileUpdate(sid, body);
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
