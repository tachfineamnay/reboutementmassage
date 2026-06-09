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
- An idempotent production patch automatically adds the missing `article_seo`, `articles`, and `lead_submissions` columns required by the current application.
- If PostgreSQL is not ready during the first attempt, the patch retries in the background while Next.js remains available.
- Schema synchronization is disabled by default. Set `RUN_DB_PUSH=1` only when the container should run `pnpm exec prisma db push` at startup.
- A failed schema synchronization is logged but never stops `node server.js`.
