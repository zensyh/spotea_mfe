import { NextResponse } from 'next/server';
import { deleteSessionCookie } from '@spotea/auth';

export async function POST() {
  const cookie = deleteSessionCookie();
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set(cookie);
  return response;
}
