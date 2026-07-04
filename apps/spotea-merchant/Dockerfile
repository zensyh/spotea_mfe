# ------------------------------------------------------------------
# Spotea Multi-Zone — Production Dockerfile
#
# Build from repo root:
#   docker build -f apps/spotea-merchant/Dockerfile -t spotea-merchant .
# ------------------------------------------------------------------

FROM oven/bun:1.3.14 AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/spotea-merchant/package.json ./apps/spotea-merchant/
COPY packages/ui/package.json ./packages/ui/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN bun install --frozen-lockfile

FROM oven/bun:1.3.14 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build --filter=spotea-merchant

FROM oven/bun:1.3.14-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/spotea-merchant/.next/standalone ./
COPY --from=builder /app/apps/spotea-merchant/public ./apps/spotea-merchant/public

EXPOSE 3001

CMD ["bun", "server.js"]
