# Spotea

**Microfrontend Multizones · Turborepo · Next.js 16 · Bun**

## Prerequisites

- **Bun** (1.3.14 atau lebih baru)
- **Node.js** (18 ke atas)
- **Docker Desktop** (opsional, dibutuhkan untuk cross-zone links)

Check this before:

```bash
bun --version
node --version
docker --version
```

---

## Getting Started

Clone repo, install, copy env template, then run.

```bash
git clone <repo-url> spotea-mfe && cd spotea-mfe
bun install
cp .env.example .env
bun dev
```

Beberapa dev server akan jalan, masing-masing di port sendiri:

- `http://localhost:3000` — shell (tanpa basePath)
- `http://localhost:3001/app1`
- `http://localhost:3002/app2`
- `http://localhost:3003/app3`
- `http://localhost:3004/app4`

Karena tiap app jalan di port terpisah, cross-zone links belum resolve sampai reverse proxy dipasang.

---

## Reverse Proxy

nginx dipasang di depan semua app supaya semua request masuk lewat port 80 dan di-route berdasarkan path. Jalankan app seperti biasa, lalu di terminal kedua:

```bash
docker compose -f docker-compose.dev.yml up
```

Buka `http://localhost` (bukan port masing-masing). Routing:

- `/app1/*` -> merchant
- `/app2/*` -> admin
- `/app3/*` -> consumer
- `/app4/*` -> account
- sisanya -> shell

Cross-zone links, cookies, dan auth jalan natural karena satu origin.

---

## Commands

```bash
bun dev                          # jalankan semua secara parallel
bun dev --filter=merchant        # filter satu app/package
bun lint                         # lint seluruh repo
bun check-types                  # type-check
bun format                       # format
bun add zustand --filter=consumer   # tambah dependency ke app tertentu
```

**Sebelum push**, jalankan verification pipeline lengkap:

```bash
bun lint && bun check-types && bun run build
```

Ketiganya harus pass tanpa error.

---

## Environment Variables

```bash
cp .env.example .env
```

- `BACKEND_API_URL` — endpoint REST API.
- `JWT_SECRET` — signing token server-side.
- `NEXT_PUBLIC_APP_URL` — `http://localhost` untuk development, atau domain production.

---

## Production (Docker)

```bash
docker compose up --build
```

Tiap app di-build lewat multi-stage Dockerfile (`deps -> builder -> runner`) dengan Next.js `output: "standalone"`. Build satu image saja:

```bash
docker build -f apps/consumer/Dockerfile -t consumer .
```

---

## Architecture Notes

- **`middleware.ts` sudah tidak ada di Next.js 16.** Tiap app pakai `proxy.ts`.
- **Cross-zone navigation wajib pakai `<a>` atau `window.location.href`**, bukan `<Link>` / `router.push()` — app dengan basePath akan prepend basePath-nya ke tiap href.
- **Dependencies flow inward.** Pages -> features -> shared code -> packages. Tidak sebaliknya.
- **Semua HTTP lewat BFF.** Client memanggil fetcher -> `/api/*` route handler -> attach JWT -> backend. Tidak ada fetch langsung dari browser ke backend.
