#!/bin/sh
set -eu

if [ "${RUN_DB_PUSH:-0}" = "1" ]; then
  if [ -n "${DATABASE_URL:-}" ]; then
    echo "Generating Prisma client..."
    pnpm exec prisma generate

    echo "Applying Prisma schema with pnpm prisma db push..."
    pnpm exec prisma db push
  else
    echo "DATABASE_URL is not set; skipping Prisma schema sync."
  fi
else
  echo "Skipping Prisma schema sync on boot."
fi

exec node server.js
