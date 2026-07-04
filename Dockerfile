FROM node:20-alpine AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable \
  && corepack prepare pnpm@10.14.0 --activate

FROM base AS deps

RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Lint is enforced in CI; do not block production image builds on eslint.
RUN pnpm build

# Bundle prisma seed for production container (no tsx / TS sources in runtime image).
RUN pnpm dlx esbuild prisma/seed.ts \
  --bundle \
  --platform=node \
  --format=cjs \
  --outfile=scripts/seed.bundle.cjs \
  --packages=external \
  --alias:@=./src

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV HOME=/app
ENV XDG_CACHE_HOME=/app/.cache
ENV COREPACK_HOME=/app/.cache/node/corepack
ENV PNPM_HOME=/app/.local/share/pnpm
ENV PNPM_STORE_PATH=/app/.pnpm-store
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN apk add --no-cache libc6-compat

RUN addgroup -g 1001 -S nodejs \
  && adduser -S -D -H -u 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/scripts/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=builder --chown=nextjs:nodejs /app/scripts/run-migrate-deploy.sh ./scripts/run-migrate-deploy.sh
COPY --from=builder --chown=nextjs:nodejs /app/scripts/run-seed.sh ./scripts/run-seed.sh
COPY --from=builder --chown=nextjs:nodejs /app/scripts/seed.bundle.cjs ./scripts/seed.bundle.cjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/sync-production-schema.mjs ./scripts/sync-production-schema.mjs

# Next standalone inclut le client Prisma, mais pas le CLI ni les engines binaires.
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs

RUN mkdir -p /app/uploads /app/storage/uploads /app/.cache/node/corepack /app/.local/share/pnpm /app/.pnpm-store \
  && sed -i 's/\r$//' ./docker-entrypoint.sh ./scripts/run-migrate-deploy.sh ./scripts/run-seed.sh \
  && chmod +x ./docker-entrypoint.sh ./scripts/run-migrate-deploy.sh ./scripts/run-seed.sh \
  && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
