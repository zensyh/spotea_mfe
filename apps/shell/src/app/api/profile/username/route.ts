import { NextResponse } from 'next/server';
import { parseBody } from '@/shared/lib/body-utils';
import { requireSession, protectedFetch, updateSession } from '@repo/auth';
import { handleApi } from '@/shared/lib/handle-api';

async function handleUsernameChange(sid: string, body: Record<string, unknown>) {
  const res = await protectedFetch(sid, '/profile/username', {
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
  return handleApi(async () => {
    const session = await requireSession();
    const body = await parseBody(request);
    return await handleUsernameChange(session.token, body);
  });
}

export async function POST(request: Request) {
  return handleApi(async () => {
    const session = await requireSession();
    const body = await parseBody(request);
    return await handleUsernameChange(session.token, body);
  });
}
