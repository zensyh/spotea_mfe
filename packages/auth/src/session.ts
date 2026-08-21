import { cookies } from 'next/headers';
import { COOKIE_NAME } from './cookie';
import { getSessionData } from './session-store';
import { HttpError } from './http-error';
import type { Session } from './types';

export async function verifySession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const sid = cookieStore.get(COOKIE_NAME)?.value;
    if (!sid) return null;

    const sessionData = await getSessionData(sid);
    if (!sessionData) return null;

    return {
      user: {
        id: sessionData.userId,
        name: sessionData.name,
        username: sessionData.username,
        role: sessionData.role,
      },
      token: sid,
    };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<Session> {
  const session = await verifySession();
  if (!session) {
    throw new HttpError(401, 'Unauthorized: session tidak ditemukan');
  }
  return session;
}
