import {
  getSessionData,
  updateSession,
  acquireRefreshLock,
  releaseRefreshLock,
  setRefreshFailed,
  getRefreshFailed,
  clearRefreshFailed,
} from './session-store';
import { API_PREFIX, REFRESH_TOKEN_EXPIRES_IN_SECONDS } from './cookie';
import type { LoginApiResponse } from './types';

const BACKEND_API_URL = process.env.BACKEND_API_URL;
const REFRESH_ENDPOINT = '/auth/refresh';
const BFF_REFRESH_LOCK_TTL_SECONDS = Number(process.env.BFF_REFRESH_LOCK_TTL_SECONDS) || 7;
const POLL_INTERVAL_MS = Number(process.env.BFF_POLL_INTERVAL_MS) || 200;
const REFRESH_FETCH_TIMEOUT_MS = (BFF_REFRESH_LOCK_TTL_SECONDS - 2) * 1000;
const MAX_POLL_ITERATIONS = Math.ceil(
  ((BFF_REFRESH_LOCK_TTL_SECONDS + 1) * 1000) / POLL_INTERVAL_MS,
);

/*
Notes:
 -- REFRESH_FETCH_TIMEOUT_MS --
 Lock TTL dikurangi 2s jadi fetch timeout. Kenapa -2?
    - Lock holder harus SELESAI (fetch + update session) sebelum lock expire,
      supaya bisa release lock sendiri di finally block. Bukan dilepas oleh
      Redis auto-expire.
  Hasil: 7s - 2s = 5s timeout (default).

  -- MAX_POLL_ITERATIONS --
  Max iterasi = lock TTL + 1s buffer, dibagi interval polling. Kenapa +1?
    - +1s extra buffer memastikan waiter selalu nunggu lebih lama dari worst
      case lock holder.
  Hasil: ceil(8s / 200ms) = 40 iterasi (default).
 */

export async function protectedFetch(
  sid: string,
  path: string,
  options: RequestInit = {},
  retried = false,
): Promise<Response> {
  if (!BACKEND_API_URL) throw new Error('BACKEND_API_URL not set');

  const session = await getSessionData(sid);
  if (!session) {
    console.warn(`[BFF] No session in store for sid=${sid.substring(0, 8)}`);
    return new Response(JSON.stringify({ message: 'Session expired' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = `${BACKEND_API_URL}${API_PREFIX}${path}`;

  console.log(url)

  const hasContentType = Object.keys(options.headers || {}).some(
    (k) => k.toLowerCase() === 'content-type',
  );

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(hasContentType ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (res.status === 401 && !retried) {
    const refreshed = await refreshSessions(sid);
    if (refreshed) {
      return protectedFetch(sid, path, options, true);
    }
    return new Response(
      JSON.stringify({ message: 'Session expired, please login again' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return res;
}

async function refreshSessions(sid: string): Promise<boolean> {
  const lockAcquired = await acquireRefreshLock(
    sid,
    BFF_REFRESH_LOCK_TTL_SECONDS,
  );
  if (!lockAcquired) {
    return pollForTokenChange(sid);
  }

  try {
    await clearRefreshFailed(sid);

    const session = await getSessionData(sid);
    if (!session) {
      console.warn(
        `[BFF] Session disappeared during refresh for sid=${sid.substring(0, 8)}`,
      );
      return false;
    }

    if (!BACKEND_API_URL) {
      console.error('[BFF] BACKEND_API_URL is not set — refresh aborted');
      return false;
    }

    const refreshRes = await fetch(`${BACKEND_API_URL}${REFRESH_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
      signal: AbortSignal.timeout(REFRESH_FETCH_TIMEOUT_MS),
    });

    if (!refreshRes.ok) {
      console.warn(
        `[BFF] Refresh failed: HTTP ${refreshRes.status} for sid=${sid.substring(0, 8)}`,
      );
      await setRefreshFailed(sid);
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
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      console.error(
        `[BFF] Refresh fetch timed out after ${REFRESH_FETCH_TIMEOUT_MS}ms for sid=${sid.substring(0, 8)}`,
      );
    } else {
      console.error(
        `[BFF] Refresh fetch failed for sid=${sid.substring(0, 8)}`,
        err,
      );
    }
    // Signal failure to polling waiters so they can bail early instead of
    // waiting for the full poll duration. Best-effort - don't let logging
    // failure mask the actual refresh error.
    try {
      await setRefreshFailed(sid);
    } catch { /* empty */ }
    return false;
  } finally {
    await releaseRefreshLock(sid);
  }
}

async function pollForTokenChange(sid: string): Promise<boolean> {
  const session = await getSessionData(sid);
  if (!session) return false;
  const snapshotAccessToken = session.accessToken;

  let pollAttempts = 0;
  const maxPollAttempts = MAX_POLL_ITERATIONS;

  while (pollAttempts < maxPollAttempts) {
    // ±25% jitter around POLL_INTERVAL_MS to spread load across concurrent
    // waiters instead of all hitting Redis at the same 200ms cadence.
    const jittered =
      POLL_INTERVAL_MS * 0.75 + Math.random() * POLL_INTERVAL_MS * 0.5;
    await sleep(jittered);

    const current = await getSessionData(sid);
    if (current && current.accessToken !== snapshotAccessToken) {
      return true;
    }

    // If the lock holder's refresh attempt already failed, there's no point
    // waiting for the token to change — bail early.
    if (await getRefreshFailed(sid)) {
      return false;
    }

    pollAttempts++;
  }

  console.warn(
    `[BFF] Polling for token change timed out after ${maxPollAttempts} iterations for sid=${sid.substring(0, 8)}`,
  );
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
