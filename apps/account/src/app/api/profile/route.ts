import { NextResponse } from 'next/server';
import { parseBody } from '@/shared/lib/body-utils';
import { requireSession, protectedFetch, updateSession } from '@repo/auth';
import { handleApi } from '@/shared/lib/handle-api';

async function handleProfileUpdate(sid: string, body: Record<string, unknown>) {
  const res = await protectedFetch(sid, '/profile', {
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
  return handleApi(async () => {
    const session = await requireSession();
    const body = await parseBody(request);
    return await handleProfileUpdate(session.token, body);
  });
}

export async function POST(request: Request) {
  return handleApi(async () => {
    const session = await requireSession();
    const body = await parseBody(request);
    return await handleProfileUpdate(session.token, body);
  });
}
