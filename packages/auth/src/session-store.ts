import { getRedis } from './redis';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const redisCall = (redis: any, ...args: any[]) => redis.call(...args);

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN';
  username: string;
  name: string;
  createdAt: string;
}

const SESSION_PREFIX = 'session:';
const USER_SESSIONS_PREFIX = 'user_sessions:';
const LOCK_PREFIX = 'lock:refresh:';
const REFRESH_STATUS_PREFIX = 'refresh_status:';

function sessionKey(sid: string): string {
  return `${SESSION_PREFIX}${sid}`;
}

function userSessionsKey(userId: string): string {
  return `${USER_SESSIONS_PREFIX}${userId}`;
}

function lockKey(sid: string): string {
  return `${LOCK_PREFIX}${sid}`;
}

function refreshStatusKey(sid: string): string {
  return `${REFRESH_STATUS_PREFIX}${sid}`;
}

export async function createSession(
  sid: string,
  data: SessionData,
  ttlSeconds: number,
): Promise<void> {
  const redis = getRedis();
  await redisCall(redis, 'SET', sessionKey(sid), JSON.stringify(data), 'EX', ttlSeconds.toString());
  await redis.sadd(userSessionsKey(data.userId), sid);
}

export async function getSessionData(
  sid: string,
): Promise<SessionData | null> {
  const redis = getRedis();
  const raw = await redis.get(sessionKey(sid));
  if (!raw) return null;
  return JSON.parse(raw) as SessionData;
}

export async function updateSession(
  sid: string,
  data: Partial<SessionData>,
  ttlSeconds?: number,
): Promise<void> {
  const redis = getRedis();
  const existing = await getSessionData(sid);
  if (!existing) return;
  const updated = { ...existing, ...data };
  const args: string[] = ['SET', sessionKey(sid), JSON.stringify(updated)];
  if (ttlSeconds !== undefined) {
    args.push('EX', ttlSeconds.toString());
  } else {
    args.push('KEEPTTL');
  }
  await redisCall(redis, ...args);
}

export async function deleteSession(sid: string): Promise<string | null> {
  const redis = getRedis();
  const session = await getSessionData(sid);
  if (session) {
    await redis.srem(userSessionsKey(session.userId), sid);
  }
  await redis.del(sessionKey(sid));
  return session?.userId ?? null;
}

export async function getUserSessions(
  userId: string,
): Promise<string[]> {
  const redis = getRedis();
  return redis.smembers(userSessionsKey(userId));
}

export async function deleteUserSessions(userId: string): Promise<void> {
  const redis = getRedis();
  const sids = await redis.smembers(userSessionsKey(userId));
  if (sids.length === 0) return;
  const pipeline = redis.pipeline();
  for (const sid of sids) {
    pipeline.del(sessionKey(sid));
  }
  pipeline.del(userSessionsKey(userId));
  await pipeline.exec();
}

export async function acquireRefreshLock(
  sid: string,
  ttlSeconds = 5,
): Promise<boolean> {
  const redis = getRedis();
  const result = await redisCall(
    redis,
    'SET',
    lockKey(sid),
    Date.now().toString(),
    'NX',
    'EX',
    ttlSeconds.toString(),
  );
  return result === 'OK';
}

export async function releaseRefreshLock(sid: string): Promise<void> {
  const redis = getRedis();
  await redis.del(lockKey(sid));
}

export async function setRefreshFailed(sid: string): Promise<void> {
  const redis = getRedis();
  // 10s TTL — long enough for all polling waiters to detect failure,
  // short enough to auto-clean if a waiter never checks.
  await redis.set(refreshStatusKey(sid), 'failed', 'EX', '10');
}

export async function getRefreshFailed(sid: string): Promise<boolean> {
  const redis = getRedis();
  const status = await redis.get(refreshStatusKey(sid));
  return status === 'failed';
}

export async function clearRefreshFailed(sid: string): Promise<void> {
  const redis = getRedis();
  await redis.del(refreshStatusKey(sid));
}
