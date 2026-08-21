# Spotea — Microfrontend Multizones

**Turborepo · Next.js 16 · Bun**

---

## Prerequisites

- Bun 1.3.14+
- Node.js 18+
- Docker Desktop

```bash
bun --version
node --version
docker --version
```

Docker is optional. Apps run fine without it, tapi cross-zone routing via reverse proxy gak akan jalan.

---

## Quick Start

```bash
bun install
cp .env.example .env
bun dev
```

Lima dev server muncul:

- shell — `http://localhost:3000`, no basePath, root /
- merchant — `http://localhost:3001/merchant`, basePath /merchant
- admin — `http://localhost:3002/admin`, basePath /admin
- consumer — `http://localhost:3003/consumer`, basePath /consumer
- account — `http://localhost:3004/account`, basePath /account

Masing-masing jalan di port sendiri. Link cross-zone kayak `/merchant` dari shell gak akan resolve tanpa reverse proxy.

---

## Reverse Proxy

Semua app di port beda -> link cross-zone broken. Solusi: nginx reverse proxy di port 80 routing based on path.

```bash
docker compose -f docker-compose.dev.yml up
```

Buka `http://localhost` (instead of individual ports). Nginx routing:

- `/merchant/*` -> merchant app
- `/admin/*` -> admin app
- `/consumer/*` -> consumer app
- `/account/*` -> account app
- sisanya -> shell app

Semua share satu origin. Hanya nginx yang jalan di Docker.

---

## Redis — Session Store

Auth pake Redis sebagai server-side session cache. Browser cuma pegang `sid` cookie (opaque session ID), token di Redis.

```bash
docker compose -f docker-compose.dev.yml up -d redis
```

Available at `localhost:6379` (mapped to host).

RedisInsight GUI di `http://localhost:5540`:

```bash
docker compose -f docker-compose.dev.yml up -d redis redisinsight
```

Konek RedisInsight: Host `redis`, Port `6379`, Name `Spotea Local`. Hostname resolve via Docker internal DNS, no auth.

---

## Day-to-Day Commands

```bash
bun dev                          # all apps parallel
bun dev --filter=merchant        # single app
bun lint --filter=consumer
bun check-types --filter=admin
bun run build --filter=account
bun lint                         # whole repo
bun check-types
bun format
bun turbo gen plumbing           # scaffold plumbing utilities into a zone
bun add zustand --filter=consumer
bun add -d vitest --filter=@repo/ui
```

Before push:

```bash
bun lint && bun check-types && bun run build
```

Zero errors required.

---

## Project Layout

```
apps/
  shell/             # no basePath, root /
  merchant/          # basePath /merchant
  admin/             # basePath /admin
  consumer/          # basePath /consumer
  account/           # basePath /account

packages/
  ui/                # @repo/ui — shared components
  auth/              # @repo/auth — session/Redis auth
  eslint-config/     # @repo/eslint-config
  typescript-config/ # @repo/typescript-config

turbo/
  generators/        # turbo gen scaffolding templates

nginx/               # reverse proxy configs
```

Setiap app adalah Next.js project independen. Code sharing lewat `packages/`, bukan cross-app import. Reverse proxy (nginx lokal / Vercel Multi-Zones di production) nyambungin semua di bawah satu domain.

---

## Environment Variables

`cp .env.example .env`

- `BACKEND_API_URL` — REST API base (e.g. `http://localhost:3033/api/v1`)
- `JWT_SECRET` — Legacy token secret, backward compat
- `NEXT_PUBLIC_APP_URL` — Public URL (`http://localhost` with nginx)
- `REDIS_URL` — Redis connection (`redis://localhost:6379`)
- `BFF_REFRESH_LOCK_TTL_SECONDS` — Token refresh lock TTL in seconds (default: `7`)
- `BFF_POLL_INTERVAL_MS` — Polling interval for concurrent waiters in ms (default: `200`)

Semua app + `@repo/auth` butuh `REDIS_URL` buat read sessions. Shell juga write ke Redis (login/logout/refresh). BFF vars hanya dibaca oleh `@repo/auth` (protectedFetch).

---

## Production (Docker)

```bash
docker compose up --build
```

Multi-stage Dockerfile (`deps -> builder -> runner`), Next.js `output: "standalone"`. Runtime cuma `server.js` + subset `node_modules`.

Build single image:

```bash
docker build -f apps/consumer/Dockerfile -t consumer .
```

---

## Architecture

### Philosophy

Spotea MFE is a **microfrontend** monorepo — not a monolith with code splitting. Each app under `apps/` is an independent Next.js project with its own build, deploy, and team. The monorepo exists for coordination via Turborepo, but the goal is **team autonomy and independent deployability**.

### Zone Layout

| Zone | Port | basePath | Business Domain |
|---|---|---|---|
| shell | 3000 | `/` | Auth (login, register, logout), landing |
| merchant | 3001 | `/merchant` | Merchant management |
| admin | 3002 | `/admin` | Admin dashboard, user management |
| consumer | 3003 | `/consumer` | Consumer-facing features |
| account | 3004 | `/account` | User profile & settings |

Zones do **not** import from each other. Code sharing only through `packages/`.

### Shared Packages Rule

Shared packages hold **domain logic or brand standards** — things that would be bugs if they diverged between zones.

| Package | Why Shared |
|---|---|
| `@repo/auth` | Domain — session, token, role logic. If two zones disagree → user can log in on one but not the other. Bug. |
| `@repo/ui` | Brand — design system, components, tokens. If two zones disagree → user sees different UIs. Trust collapse. |
| `@repo/eslint-config` | Tooling — consistent lint rules across all workspaces. |
| `@repo/typescript-config` | Tooling — consistent TS config basis. |

### Plumbing vs Domain

```
packages/           ← Domain logic & brand (MUST be identical)
  auth/             ← Session, tokens, roles
  ui/               ← Design system, consistency

apps/*/shared/lib/  ← Plumbing (owned per zone, may diverge)
  handle-api.ts     ← Route handler error wrapper
  body-utils.ts     ← Request body parser
  fetcher.ts        ← Client-side fetch wrapper
```

**Plumbing is intentionally duplicated.** Each zone owns its plumbing files and can modify them without impacting other zones. This is correct MFE behavior — independence over DRY. The DRY principle applies to **knowledge**, not code. Two zones having the same 21-line `handle-api.ts` is not knowledge duplication; if Admin needs a different error format, it changes its own file — no PR, no coordination, no breaking other zones.

### Scaffolding

Add or refresh plumbing in a zone:

```bash
bun turbo gen plumbing
```

Interactive prompts: select zone → select utilities. Templates at `turbo/generators/templates/plumbing/`. Generated files are identical at creation time but independently owned by each zone after generation.

### Next.js 16 Notes

- **`middleware.ts` is removed.** Use `src/proxy.ts` with `export function proxy(request: NextRequest)` instead.
- **Flat ESLint config** only: `eslint.config.mjs`.
- **React Compiler** enabled via `reactCompiler: true` in `next.config.ts`.
- **Tailwind CSS v4** via `@tailwindcss/postcss` plugin.
- All apps use `output: 'standalone'`.

### Cross-Zone Navigation

**Always use `<a href>` or `window.location.href` for links between zones.** Never use Next.js `<Link>` or `router.push()`.

Apps with `basePath` automatically prepend it to every `<Link>` href. A `<Link href="/admin">` from merchant becomes `/merchant/admin` — wrong zone, wrong app. Plain anchors bypass Next.js router logic. Cross-zone means leaving one app's bundle entirely — a full page load is correct behavior.

### BFF Pattern

```
Browser → /api/* route handler → BACKEND_API_URL (with JWT)
```

No direct browser-to-backend fetch. All API calls go through the zone's own route handler, which attaches the JWT from the server-side session and proxies to the real backend.

### Auth

```
Browser: opaque "sid" cookie only
Server (Redis): session { userId, accessToken, refreshToken, role, ... }
```

- Shell is the **only** zone that writes sessions (login, register, logout)
- All zones read sessions via `verifySession()` / `requireSession()` from `@repo/auth`
- Token refresh uses Redis locks with polling — `protectedFetch()` handles transparent refresh


---

## Authors

- zeinirfansyah (zensyh)
