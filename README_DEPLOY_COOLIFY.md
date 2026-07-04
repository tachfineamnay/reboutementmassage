# Coolify Deployment

Coolify settings:
- Build Pack: Dockerfile
- Base Directory: /
- Dockerfile Location: /Dockerfile
- Ports Exposes: 3000
- Ports Mappings: empty
- Environment Variables: set `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `SITE_URL`, and upload variables listed in `.env.example`
- Force HTTPS: disable for first test, enable after HTTP works
- Test temporary domain first with http://xxxxx.sslip.io

Database schema:
- The web server starts even if PostgreSQL or Prisma is temporarily unavailable.
- On boot, when `DATABASE_URL` is set, the container runs `prisma migrate deploy` by default (disable with `RUN_MIGRATE_DEPLOY=0`). If the database already exists without migration history (error P3005), legacy migrations are baselined automatically, then Growth CMS migrations are applied.
- An idempotent production patch then adds any legacy `article_seo`, `articles`, and `lead_submissions` columns still missing on older databases.
- If PostgreSQL is not ready during the first attempt, the legacy patch retries in the background while Next.js remains available.
- `RUN_DB_PUSH=1` is optional and runs `prisma db push` after migrations (use only for dev-like environments).
- A failed migration or schema sync is logged but never stops `node server.js`.

## PNPM/Corepack dans le conteneur Coolify

Le conteneur runtime tourne avec l'utilisateur non-root `nextjs`, cree sans home directory. `HOME=/app` est force pour que Corepack et PNPM n'ecrivent jamais dans `/home/nextjs`.

`/app/.cache` et `/app/.pnpm-store` doivent rester writable par `nextjs` : Corepack stocke ses shims PNPM dans `/app/.cache/node/corepack`, et PNPM utilise `/app/.pnpm-store` pour le store des packages.

Apres redeploy, tester ces commandes dans le terminal du conteneur Coolify :

```sh
cd /app
pnpm -v
pnpm exec prisma generate
pnpm exec prisma validate
```

Manual migration inside the Coolify container:

```sh
cd /app
./node_modules/.bin/prisma migrate resolve --applied "20260617180000_add_admin_settings"
./node_modules/.bin/prisma migrate resolve --applied "20260617230000_add_article_studio_seo_intelligence"
./node_modules/.bin/prisma migrate resolve --applied "20260630000000_baseline"
./node_modules/.bin/prisma migrate deploy
```

Or run the bundled script (after redeploy):

```sh
cd /app
sh ./scripts/run-migrate-deploy.sh
sh ./scripts/run-seed.sh
```

The production container does not include `tsx`. Seed is bundled at image build time as `scripts/seed.bundle.cjs`. Do not use `pnpm exec tsx prisma/seed.ts` in Coolify.

Required env for seed: `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Optional: `SEED_GROWTH_CDMX=1` (default).
