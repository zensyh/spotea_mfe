# Spotea — Cafe Finder Platform

**Microfrontend Multizones · Turborepo · Next.js 16 · Bun**

Spotea is a coffeeshop finder platform where customers discover cafes, merchants manage
their profiles, and admins run the platform. Five separate
Next.js apps behind one domain, each owned by a different context.

---

## Prerequisites

- **Bun** (1.3.14 or newer),
- **Node.js** (18 or above),
- **Docker Desktop**

```
Docker is optional — the apps still
run fine without it, but links between zones won't work until you add the proxy.
```

Check them before starting:

```bash
bun --version
node --version
docker --version
```

---

## Getting Started

Clone the repo, install everything, copy the env template, and go.

```bash
git clone <repo-url> spotea-mfe && cd spotea-mfe
bun install
cp .env.example .env
bun dev
```

That gives you five dev servers:

- Shell at `http://localhost:3000` — landing page and public routing (no basePath).
- Merchant at `http://localhost:3001/merchant` — cafe owner dashboard.
- Admin at `http://localhost:3002/admin` — platform administration.
- Consumer at `http://localhost:3003/consumer` — customer-facing cafe discovery.
- Account at `http://localhost:3004/account` — user profile and settings.

Since each app runs on its own port, cross-zone links like `/merchant` clicked from
the shell app won't resolve correctly yet. That's what the reverse proxy is for.

---

## Reverse Proxy (make cross-zone links actually work)

The problem: five apps on five different ports means a link to `/merchant` from
`localhost:3000` just hits the shell server, which doesn't know about `/merchant`.

The fix: put an nginx reverse proxy in front of all five. Everything comes through
port 80 and nginx decides where each request goes based on its path.

Start your apps like usual, then in a second terminal:

```bash
docker compose -f docker-compose.dev.yml up
```

Now open `http://localhost` instead of the individual ports. Nginx routes like this:

- `/merchant/*` goes to the merchant app.
- `/admin/*` goes to the admin app.
- `/consumer/*` goes to the consumer app.
- `/account/*` goes to the account app.
- Everything else goes to the shell app.

All cross-zone links, cookies, and auth work naturally because everything shares one
origin. Only nginx runs inside Docker.

## Redis (Session Store)

The auth system uses **Redis** as a server-side session cache. All tokens live in Redis,
not in browser cookies — the browser only holds an opaque session ID (`sid` cookie).

### Start Redis

```bash
docker compose -f docker-compose.dev.yml up -d redis
```

Available at `localhost:6379` (mapped to host for dev).

### RedisInsight (GUI)

A Redis GUI is available at `http://localhost:5540`:

```bash
docker compose -f docker-compose.dev.yml up -d redis redisinsight
```

Then open `http://localhost:5540` and connect:
| Field | Value |
|---|---|
| Host | `redis` |
| Port | `6379` |
| Name | `Spotea Local` |

The `redis` hostname resolves via Docker's internal DNS — both containers are on
the same network. No password required.

---

## Day-to-Day Commands

Run everything in parallel:

```bash
bun dev
```

Filter to a single app or package:

```bash
bun dev --filter=merchant
bun lint --filter=consumer
bun check-types --filter=admin
bun run build --filter=account
```

Lint, type-check, and format across the whole repo:

```bash
bun lint
bun check-types
bun format
```

Add a dependency to a specific app:

```bash
bun add zustand --filter=consumer
bun add -d vitest --filter=@repo/ui
```

**Before pushing**, always run the full verification pipeline:

```bash
bun lint && bun check-types && bun run build
```

All three must pass with zero errors.

---

---

## Project Layout

Five apps, three shared packages, and Docker plumbing.

```
apps/
  shell/              #Landing page & public routing, no basePath (root /)
  merchant/           #Cafe owner dashboard, basePath /merchant
  admin/              #Platform administration, basePath /admin
  consumer/           #Customer-facing cafe discovery, basePath /consumer
  account/            #User profile & settings, basePath /account

packages/
  ui/                  #@repo/ui — shared React components (Button, Card, etc.)
  eslint-config/       #@repo/eslint-config — ESLint 9 flat config presets
  typescript-config/   #@repo/typescript-config — shared tsconfig presets

nginx/                 #Reverse proxy configs (dev and production)
```

Each app is a fully independent Next.js project. They share code through `packages/`,
not by importing across app boundaries. The reverse proxy (nginx or Vercel Multi-Zones
in production) stitches them back together under one domain.

---

## Environment Variables

Copy the template and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `BACKEND_API_URL` | REST API base URL (e.g. `http://localhost:3033/api/v1`) |
| `JWT_SECRET` | Secret for token verification (legacy, kept for backward compat) |
| `NEXT_PUBLIC_APP_URL` | Public URL (`http://localhost` with nginx, or production domain) |
| `REDIS_URL` | Redis connection string (e.g. `redis://localhost:6379`) |

All five apps and the `@repo/auth` package need `REDIS_URL` to read sessions.
The shell app also writes to Redis (login, logout, token refresh).

---

## Production (Docker)

All-in-Docker stack with nginx and five app containers:

```bash
docker compose up --build
```

Each app gets built through a multi-stage Dockerfile (`deps -> builder -> runner`) using
Next.js `output: "standalone"` to keep the runtime image small — only `server.js` and
the subset of `node_modules` needed at runtime, no source code or dev dependencies.

Build a single image if you prefer:

```bash
docker build -f apps/consumer/Dockerfile -t consumer .
```

---

## Architecture Notes

A few things worth knowing before you write code in this repo:

- **`middleware.ts` is gone in Next.js 16.** Every app uses `proxy.ts` instead.

- **Cross-zone navigation must use `<a>` tags or `window.location.href`, not Next.js
  `<Link>` or `router.push()`.** Apps with a basePath (merchant, admin, consumer,
  account) will prepend their basePath to every `<Link>` href and every
  `router.push()` call. So `<Link href="/admin">` in the merchant app becomes
  `/merchant/admin` — wrong zone. The same happens with
  `useRouter().push("/admin")`.

  What works instead:

  - `<a href="/admin">` — plain anchor, no Next.js logic.
  - `window.location.href = "/admin"` — works inside a button or any event handler.
  - A `<button>` with an `onClick` that sets `window.location.href`.

  Why does it use a full page load instead of SPA navigation? Because cross-zone means
  you are leaving one Next.js app and entering another — different bundle, different
  React tree, different port in dev. There is no shared runtime between zones
  (this is not module federation). A full navigation request is exactly what you want:
  the browser hits the reverse proxy, nginx routes to the correct app, and that app
  renders its page from scratch.

- **Dependencies flow inward.** App pages import from features, features import from
  shared code, shared code imports from packages. Never the other direction.

- **All HTTP goes through BFF.** Client code calls a fetcher, which hits a `/api/*`
  route handler, which attaches the JWT and calls the real backend. No fetch directly
  from browser to backend.

---

## Authentication Flow

Auth uses an **opaque session** pattern with Redis:

```
Browser ──(sid cookie)──> Next.js BFF ──(Bearer access_token)──> REST API
                                  │
                              (Redis)
                            session cache
```

### Login
1. Browser `POST /api/auth/login` → BFF
2. BFF forwards to backend with device headers (`x-forwarded-for`, `x-device-id`, `x-device-name`)
3. Backend returns `{ access_token, refresh_token, user }`
4. BFF generates `sid` (UUID), stores session in Redis (`session:<sid>`) with 15min TTL
5. BFF adds sid to `user_sessions:<userId>` set
6. BFF sets `sid` cookie (`HttpOnly`, `Secure`, `SameSite=Strict`)
7. Browser is redirected to role-based home (`/consumer`, `/merchant`, `/admin`)

### Authenticated Requests
1. Zone app's `proxy.ts` checks `sid` cookie exists (fast pass-through)
2. Zone app's `layout.tsx` calls `verifySession()` → reads `sid` cookie → `GET session:<sid>` from Redis → returns session data
3. Protected backend calls use `authenticatedFetch()` helper which attaches `Authorization: Bearer <accessToken>` from Redis

### Token Refresh (Race Condition Guard)
When backend returns 401 (expired access token):
1. BFF acquires Redis distributed lock: `SET lock:refresh:<sid> NX EX 5`
2. **Lock acquired** → POST `/auth/refresh` → update Redis with new tokens (`KEEPTTL`) → release lock → retry
3. **Lock not acquired** → poll `GET session:<sid>` until token changes (up to 3s) → retry

### Logout
1. Browser `POST /api/auth/logout` → BFF
2. BFF reads `sid` cookie, gets session from Redis
3. BFF calls backend `POST /auth/revoke` with refresh token
4. BFF deletes `session:<sid>` and `SREM user_sessions:<userId>` in Redis
5. BFF clears `sid` cookie

### Redis Key Schema
| Key | Type | Value | TTL |
|---|---|---|---|
| `session:<sid>` | String | `{ accessToken, refreshToken, userId, role, username, name, createdAt }` JSON | 15 min |
| `user_sessions:<userId>` | Set | Set of `sid` strings | No expiry (managed manually) |
| `lock:refresh:<sid>` | String | Timestamp | 5 sec |
