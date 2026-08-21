import { NextResponse } from 'next/server';
import { parseBody } from '@/shared/lib/body-utils';
import { requireSession, deleteUserSessions, HttpError } from '@repo/auth';
import { handleApi } from '@/shared/lib/handle-api';

export async function POST(request: Request) {
  return handleApi(async () => {
    const session = await requireSession();

    if (session.user.role !== 'ADMIN') {
      throw new HttpError(403, 'Forbidden');
    }

    const body = await parseBody(request);
    const userId = body.userId as string | undefined;
    if (!userId) {
      throw new HttpError(400, 'userId is required');
    }

    await deleteUserSessions(userId);

    return NextResponse.json(
      { success: true, message: 'All sessions revoked' },
      { status: 200 },
    );
  });
}
