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

`BACKEND_API_URL` points to your REST API. `JWT_SECRET` is for signing
tokens server-side. `NEXT_PUBLIC_APP_URL` should be `http://localhost` for development
(behind the nginx proxy) or your production domain.

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
