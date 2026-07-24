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
  eslint-config/     # @repo/eslint-config
  typescript-config/ # @repo/typescript-config

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

Semua app + `@repo/auth` butuh `REDIS_URL` buat read sessions. Shell juga write ke Redis (login/logout/refresh).

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

## Architecture Notes

1. **`middleware.ts` di Next.js 16 sudah dihapus.** Setiap app pake `proxy.ts`.

2. **Cross-zone navigation: pake `<a>` atau `window.location.href`, jangan pake Next.js `<Link>` atau `router.push()`.** Apps dengan basePath otomatis prepend basePath-nya ke setiap href, jadi `<Link href="/admin">` dari merchant jadi `/merchant/admin` — wrong zone. Plain anchor atau `window.location.href` bypass Next.js router logic. Cross-zone berarti ninggalin satu Next.js app dan masuk ke app lain — bundle beda, React tree beda, port beda di dev. Full page load adalah behavior yang benar.

3. **Dependency flow inward.** Pages -> features -> shared code -> packages. Never reverse.

4. **Semua HTTP lewat BFF.** Client pake fetcher -> hits `/api/*` route handler -> attach JWT -> call real backend. No direct fetch from browser to backend.

---

## Authors

- zeinirfansyah
