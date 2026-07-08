import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from './cookie';
import type { Session } from './types';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable tidak diset');
  }
  return new TextEncoder().encode(secret);
}

export async function verifySession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const secret = getSecret();
    const { payload } = await jwtVerify<Session>(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  return verifySession();
}

export async function requireSession(): Promise<Session> {
  const session = await verifySession();
  if (!session) {
    throw new Error('Unauthorized: session tidak ditemukan');
  }
  return session;
}
