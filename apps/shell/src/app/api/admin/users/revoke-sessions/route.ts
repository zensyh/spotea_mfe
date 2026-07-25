import { NextResponse } from 'next/server';
import { extractCookie } from '@/shared/lib/cookie-utils';
import { parseBody } from '@/shared/lib/body-utils';
import { getSessionData, deleteUserSessions } from '@repo/auth';

export async function POST(request: Request) {
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

    const body = await parseBody(request);
    const userId = body.userId as string | undefined;
    if (!userId) {
      return NextResponse.json(
        { message: 'userId is required' },
        { status: 400 },
      );
    }

    await deleteUserSessions(userId);

    return NextResponse.json(
      { success: true, message: 'All sessions revoked' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
