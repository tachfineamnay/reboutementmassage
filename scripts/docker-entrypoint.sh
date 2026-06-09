#!/bin/sh
set -eu

if [ "${RUN_DB_PUSH:-0}" = "1" ]; then
  if [ -n "${DATABASE_URL:-}" ]; then
    echo "Applying Prisma schema..."
    if pnpm exec prisma db push; then
      echo "Prisma schema synchronized."
    else
      echo "WARNING: Prisma schema synchronization failed; starting the web server anyway." >&2
    fi
  else
    echo "DATABASE_URL is not set; skipping Prisma schema sync."
  fi
else
  echo "Skipping Prisma schema sync on boot."
fi

exec node server.js
