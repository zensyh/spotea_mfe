import { NextResponse } from 'next/server';
import { verifySession } from '@spotea/auth';

export async function GET() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json(
      { message: 'Tidak terautentikasi' },
      { status: 401 },
    );
  }

  return NextResponse.json({ user: session.user }, { status: 200 });
}
