# Spotea — Cafe Finder Platform

**Microfrontend Multizones · Turborepo · Next.js 16 · Bun**

Spotea adalah platform cafe finder dengan arsitektur Microfrontend Multizones.

---

## Prasyarat

| Tools | Versi | Cek |
|---|---|---|
| **Bun** | ≥ 1.3.14 | `bun --version` |
| **Node.js** | ≥ 18 | `node --version` |
| **Docker Desktop** | latest | `docker --version` |
| **Git** | ≥ 2.x | `git --version` |

> Docker hanya diperlukan untuk reverse proxy di dev (nginx) dan production build.
> App bisa dijalankan tanpa Docker — tapi cross-zone link tidak akan work.

---

## Quick Start (5 menit)

```bash
# 1. Clone
git clone <repo-url> spotea-mfe && cd spotea-mfe

# 2. Install dependencies
bun install

# 3. Setup environment
cp .env.example .env

# 4. Jalankan semua app
bun dev
```

Buka di browser:
| App | URL | Port |
|---|---|---|
| Consumer | http://localhost:3000 | 3000 |
| Merchant | http://localhost:3001/merchant | 3001 |
| Back Office | http://localhost:3002/backoffice | 3002 |

> **Catatan:** Tanpa reverse proxy, cross-zone link (misal dari consumer ke `/merchant`) akan **404**
> karena setiap app berjalan di port berbeda. Untuk cross-zone link yang working, lanjut ke Setup Reverse Proxy.

---

## Setup Reverse Proxy (cross-zone link working)

```bash
# 1. Jalankan 3 app di host
bun dev

# 2. Di terminal terpisah, jalankan nginx reverse proxy
docker compose -f docker-compose.dev.yml up

# 3. Semua app bisa diakses dari 1 origin (port 80)
open http://localhost
```

Dengan reverse proxy, `<a href="/merchant">` dari consumer akan diresolve ke port yang benar
oleh nginx. Cookie, auth, semuanya bekerja dalam 1 origin — persis seperti di production.

**Yang jalan di Docker:** nginx saja. Apps tetap di host.

---


### Filter per app

```bash
bun dev --filter=spotea-merchant
bun lint --filter=spotea-consumer
bun check-types --filter=spotea-backoffice
bun run build --filter=spotea-merchant
```

### Contoh Penambahan Dependency

```bash
bun add zustand --filter=spotea-consumer      # tambah ke 1 app
bun add -d vitest --filter=@repo/ui            # tambah ke package
```

### Routing

Setiap app adalah Next.js standalone — bukan module federation. Nginx/Vercel memutuskan app mana
yang menangani request berdasarkan path. Production deployment: app di-deploy terpisah, reverse
proxy di depan (Vercel Multi-Zones / nginx).

---

## Production Build (Docker)

```bash
# Build & run semua service
docker compose up --build

# Hanya build image (tanpa run)
docker compose build

# Stop
docker compose down
```

Setiap app punya multi-stage `Dockerfile` (`deps -> builder -> runner`) dengan Next.js
`output: "standalone"` — menghasilkan runtime image minimal.

```bash
# Build 1 app saja
docker build -f apps/spotea-consumer/Dockerfile -t spotea-consumer .
```

---

## Environment Variables

Copy template dan isi:

```bash
cp .env.example .env
```

| Variabel | Wajib | Keterangan |
|---|---|---|
| `BACKEND_API_URL` | ya | URL REST API backend |
| `JWT_SECRET` | ya | Min 32 karakter, untuk sign JWT |
| `NEXT_PUBLIC_APP_URL` | ya | `http://localhost` (dev) / `https://spotea.com` (prod) |

---

## Tech Stack

| Teknologi | Versi |
|---|---|
| Next.js | 16.2.10 |
| React | 19.2.4 |
| TypeScript | 5.9 |
| Tailwind CSS | v4 |
| Turborepo | 2.10 |
| Bun | 1.3.14 |

> **Next.js 16 breaking changes:** `middleware.ts` deprecated -> gunakan `proxy.ts`.


## Verifikasi Sebelum Push/PR

```bash
bun lint && bun check-types && bun run build
```

Ketiganya harus **0 error** sebelum push.


-zeinirfansyah