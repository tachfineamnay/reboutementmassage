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
- The Docker entrypoint runs `pnpm exec prisma db push` before `node server.js` when `DATABASE_URL` is set.
- Schema synchronization is enabled by default because this repository currently has no Prisma migrations. Set `RUN_DB_PUSH=0` only if synchronization is handled elsewhere.
