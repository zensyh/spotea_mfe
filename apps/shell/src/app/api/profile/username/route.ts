import { NextResponse } from 'next/server';
import { extractCookie } from '@/shared/lib/cookie-utils';
import { parseBody } from '@/shared/lib/body-utils';
import { authenticatedFetch, updateSession } from '@repo/auth';

async function handleUsernameChange(sid: string, body: Record<string, unknown>) {
  const res = await authenticatedFetch(sid, '/profile/username', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (res.ok && data.data?.username) {
    await updateSession(sid, { username: data.data.username });
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
    return await handleUsernameChange(sid, body);
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
    return await handleUsernameChange(sid, body);
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
