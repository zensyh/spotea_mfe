import { NextResponse } from 'next/server';
import { requireSession } from '@repo/auth';
import { handleApi } from '@/shared/lib/handle-api';

export async function GET() {
  return handleApi(async () => {
    const session = await requireSession();
    return NextResponse.json(
      {
        user: {
          id: session.user.id,
          name: session.user.name,
          username: session.user.username,
          role: session.user.role,
        },
      },
      { status: 200 },
    );
  });
}
