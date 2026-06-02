#!/bin/sh
set -eu

if [ "${SKIP_DB_PUSH:-0}" != "1" ]; then
  if [ -n "${DATABASE_URL:-}" ]; then
    echo "Applying Prisma schema with prisma db push..."
    node node_modules/prisma/build/index.js db push
  else
    echo "DATABASE_URL is not set; skipping Prisma schema sync."
  fi
fi

exec node server.js
