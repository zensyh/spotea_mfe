# ------------------------------------------------------------------
# Spotea Multi-Zone — Production Dockerfile
#
# Build from repo root:
#   docker build -f apps/account/Dockerfile -t account .
# ------------------------------------------------------------------

# ── Stage 1: Install dependencies ──
FROM oven/bun:1.3.14 AS deps
WORKDIR /app

# Copy workspace config & lockfile for install
COPY package.json bun.lock ./
COPY apps/account/package.json ./apps/account/
COPY packages/ui/package.json ./packages/ui/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN bun install --frozen-lockfile

# ── Stage 2: Build ──
FROM oven/bun:1.3.14 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build only this app (Turbo handles dependency graph)
RUN bun run build --filter=account

# ── Stage 3: Runtime ──
FROM oven/bun:1.3.14-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# standalone/ output is self-contained (includes node_modules subset)
COPY --from=builder /app/apps/account/.next/standalone ./

# Static assets (images, fonts, etc.) must be copied separately
COPY --from=builder /app/apps/account/public ./apps/account/public

# Next.js standalone copies the workspace structure; static files under:
#   apps/account/.next/static/ -> served by Next.js automatically
#   apps/account/public/      -> served as /public at the app root

EXPOSE 3004

CMD ["bun", "server.js"]
