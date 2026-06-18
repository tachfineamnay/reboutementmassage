#!/bin/sh
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Checking production database schema..."
  if ! node ./scripts/sync-production-schema.mjs; then
    echo "WARNING: Initial schema patch failed; retrying in the background." >&2
    node ./scripts/sync-production-schema.mjs --retry &
  fi
else
  echo "DATABASE_URL is not set; skipping database schema patch."
fi

if [ "${RUN_DB_PUSH:-0}" = "1" ]; then
  if [ -n "${DATABASE_URL:-}" ]; then
    echo "Applying Prisma schema..."
    if node ./node_modules/prisma/build/index.js db push; then
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
