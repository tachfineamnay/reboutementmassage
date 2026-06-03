# Coolify Deployment

Coolify settings:
- Build Pack: Dockerfile
- Base Directory: /
- Dockerfile Location: /Dockerfile
- Ports Exposes: 80
- Ports Mappings: empty
- Environment Variables: set `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `SITE_URL`, and upload variables listed in `.env.example`
- Force HTTPS: disable for first test, enable after HTTP works
- Test temporary domain first with http://xxxxx.sslip.io

Database schema:
- The Docker entrypoint runs `pnpm exec prisma generate` and `pnpm exec prisma db push` before `node server.js` when `RUN_DB_PUSH=1` and `DATABASE_URL` are set.
- Leave `RUN_DB_PUSH` unset or set to `0` if schema synchronization is handled elsewhere.
