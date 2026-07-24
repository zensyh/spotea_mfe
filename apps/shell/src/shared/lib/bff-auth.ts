import {
  getSessionData,
  updateSession,
  acquireRefreshLock,
  releaseRefreshLock,
} from '@repo/auth';
import type { LoginApiResponse } from '@repo/auth';

const BACKEND_API_URL = process.env.BACKEND_API_URL;
const REFRESH_ENDPOINT = '/auth/refresh';

function getDeviceName(userAgent: string | null): string {
  if (!userAgent) return 'Web Browser';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg'))
    return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome'))
    return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  return 'Web Browser';
}

export function buildDeviceHeaders(
  request: Request,
  deviceId: string,
): Record<string, string> {
  const forwardedFor =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = request.headers.get('user-agent');
  const deviceName = getDeviceName(userAgent);

  return {
    'Content-Type': 'application/json',
    'x-forwarded-for': forwardedFor,
    'x-device-id': deviceId,
    'x-device-name': deviceName,
  };
}

export async function authenticatedFetch(
  sid: string,
  path: string,
  options: RequestInit & { retried?: boolean } = {},
): Promise<Response> {
  if (!BACKEND_API_URL) throw new Error('BACKEND_API_URL not set');

  const session = await getSessionData(sid);
  if (!session) {
    return new Response(JSON.stringify({ message: 'Session expired' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = `${BACKEND_API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (res.status === 401 && !options.retried) {
    const refreshed = await refreshSessionTokens(sid);
    if (refreshed) {
      return authenticatedFetch(sid, path, {
        ...options,
        retried: true,
      });
    }
    return new Response(
      JSON.stringify({ message: 'Session expired, please login again' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return res;
}

async function refreshSessionTokens(sid: string): Promise<boolean> {
  const lockAcquired = await acquireRefreshLock(sid);
  if (!lockAcquired) {
    let pollAttempts = 0;
    const maxPollAttempts = 10;
    while (pollAttempts < maxPollAttempts) {
      await sleep(300);
      const session = await getSessionData(sid);
      if (session) return true;
      pollAttempts++;
    }
    return false;
  }

  try {
    const session = await getSessionData(sid);
    if (!session) return false;

    if (!BACKEND_API_URL) return false;

    const refreshRes = await fetch(
      `${BACKEND_API_URL}${REFRESH_ENDPOINT}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refreshToken }),
      },
    );

    if (!refreshRes.ok) {
      return false;
    }

    const refreshData: LoginApiResponse = await refreshRes.json();
    const newTokens = refreshData.data;

    await updateSession(sid, {
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token,
    });

    return true;
  } finally {
    await releaseRefreshLock(sid);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
