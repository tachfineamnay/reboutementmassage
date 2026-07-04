#!/bin/sh
# Runs the bundled production seed (admin user + optional Growth CDMX).
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required."
  exit 1
fi

if [ -z "${ADMIN_EMAIL:-}" ] || [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo "ADMIN_EMAIL and ADMIN_PASSWORD are required."
  exit 1
fi

if [ ! -f "./scripts/seed.bundle.cjs" ]; then
  echo "Missing ./scripts/seed.bundle.cjs — redeploy the latest container image."
  exit 1
fi

echo "Running production seed..."
node ./scripts/seed.bundle.cjs
