import { getSessionData, updateSession, acquireRefreshLock, releaseRefreshLock } from './session-store';
import { REFRESH_TOKEN_EXPIRES_IN_SECONDS } from './cookie';
import type { LoginApiResponse } from './types';

const BACKEND_API_URL = process.env.BACKEND_API_URL;
const REFRESH_ENDPOINT = '/auth/refresh';

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
    return pollForTokenChange(sid);
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

    await updateSession(
      sid,
      {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token,
      },
      REFRESH_TOKEN_EXPIRES_IN_SECONDS,
    );

    return true;
  } finally {
    await releaseRefreshLock(sid);
  }
}

async function pollForTokenChange(sid: string): Promise<boolean> {
  const session = await getSessionData(sid);
  if (!session) return false;
  const snapshotAccessToken = session.accessToken;

  let pollAttempts = 0;
  const maxPollAttempts = 15;

  while (pollAttempts < maxPollAttempts) {
    await sleep(200);
    const current = await getSessionData(sid);
    if (current && current.accessToken !== snapshotAccessToken) {
      return true;
    }
    pollAttempts++;
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
