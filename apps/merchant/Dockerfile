# ------------------------------------------------------------------
# Spotea Multi-Zone — Production Dockerfile
#
# Build from repo root:
#   docker build -f apps/merchant/Dockerfile -t merchant .
# ------------------------------------------------------------------

FROM oven/bun:1.3.14 AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/merchant/package.json ./apps/merchant/
COPY packages/ui/package.json ./packages/ui/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN bun install --frozen-lockfile

FROM oven/bun:1.3.14 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build --filter=merchant

FROM oven/bun:1.3.14-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/merchant/.next/standalone ./
COPY --from=builder /app/apps/merchant/public ./apps/merchant/public

EXPOSE 3001

CMD ["bun", "server.js"]
