#!/bin/sh
set -eu

if [ "${RUN_DB_PUSH:-1}" = "1" ]; then
  if [ -n "${DATABASE_URL:-}" ]; then
    echo "Applying Prisma schema..."
    pnpm exec prisma db push
  else
    echo "DATABASE_URL is not set; skipping Prisma schema sync."
  fi
else
  echo "Skipping Prisma schema sync on boot."
fi

exec node server.js
