# ── Stage 1: Install deps ────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /repo

# Copy manifests first for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json            ./apps/admin/
COPY packages/core/package.json         ./packages/core/
COPY packages/api-types/package.json    ./packages/api-types/
COPY packages/i18n/package.json         ./packages/i18n/

RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /repo

COPY --from=deps /repo/node_modules                 ./node_modules
COPY --from=deps /repo/apps/admin/node_modules      ./apps/admin/node_modules

COPY . .

ENV NODE_ENV=production
# next.config.js emits output:'standalone' for non-dev builds
RUN pnpm --filter admin build

# ── Stage 3: Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# standalone output bundles all required node_modules
COPY --from=builder --chown=nextjs:nodejs \
  /repo/apps/admin/.next-production/standalone ./

# Static assets must sit next to the standalone server
COPY --from=builder --chown=nextjs:nodejs \
  /repo/apps/admin/.next-production/static \
  ./apps/admin/.next-production/static

COPY --from=builder --chown=nextjs:nodejs \
  /repo/apps/admin/public \
  ./apps/admin/public

USER nextjs
EXPOSE 3000

# Next.js standalone entry point
CMD ["node", "apps/admin/server.js"]
