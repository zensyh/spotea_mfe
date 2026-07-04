# ------------------------------------------------------------------
# Spotea Multi-Zone — Production Dockerfile
#
# Build from repo root:
#   docker build -f apps/spotea-backoffice/Dockerfile -t spotea-backoffice .
# ------------------------------------------------------------------

FROM oven/bun:1.3.14 AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/spotea-backoffice/package.json ./apps/spotea-backoffice/
COPY packages/ui/package.json ./packages/ui/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN bun install --frozen-lockfile

FROM oven/bun:1.3.14 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build --filter=spotea-backoffice

FROM oven/bun:1.3.14-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/spotea-backoffice/.next/standalone ./
COPY --from=builder /app/apps/spotea-backoffice/public ./apps/spotea-backoffice/public

EXPOSE 3002

CMD ["bun", "server.js"]
