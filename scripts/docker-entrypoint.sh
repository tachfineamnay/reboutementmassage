#!/bin/sh
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  if [ "${RUN_MIGRATE_DEPLOY:-1}" != "0" ]; then
    if ! sh ./scripts/run-migrate-deploy.sh; then
      echo "WARNING: migration step failed; starting the web server anyway." >&2
    fi
  else
    echo "RUN_MIGRATE_DEPLOY=0; skipping Prisma migrations."
  fi

  echo "Checking production database schema..."
  if ! node ./scripts/sync-production-schema.mjs; then
    echo "WARNING: Initial schema patch failed; retrying in the background." >&2
    node ./scripts/sync-production-schema.mjs --retry &
  fi
else
  echo "DATABASE_URL is not set; skipping database migrations and schema patch."
fi

if [ "${RUN_DB_PUSH:-0}" = "1" ]; then
  if [ -n "${DATABASE_URL:-}" ]; then
    echo "Applying Prisma schema (db push)..."
    if ./node_modules/.bin/prisma db push; then
      echo "Prisma schema synchronized."
    else
      echo "WARNING: Prisma schema synchronization failed; starting the web server anyway." >&2
    fi
  else
    echo "DATABASE_URL is not set; skipping Prisma schema sync."
  fi
else
  echo "Skipping Prisma db push on boot."
fi

exec node server.js
