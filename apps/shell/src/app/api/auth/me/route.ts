import { NextResponse } from 'next/server';
import { extractCookie } from '@/shared/lib/cookie-utils';
import { getSessionData } from '@repo/auth';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sid = extractCookie(cookieHeader, 'sid');

    if (!sid) {
      return NextResponse.json(
        { message: 'Tidak terautentikasi' },
        { status: 401 },
      );
    }

    const sessionData = await getSessionData(sid);

    if (!sessionData) {
      return NextResponse.json(
        { message: 'Tidak terautentikasi' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        user: {
          id: sessionData.userId,
          name: sessionData.name,
          username: sessionData.username,
          role: sessionData.role,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Tidak terautentikasi' },
      { status: 401 },
    );
  }
}


