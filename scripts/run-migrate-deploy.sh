#!/bin/sh
# Applies Prisma migrations in production. Baselines legacy migrations on P3005.
set -eu

PRISMA="./node_modules/.bin/prisma"

BASELINE_MIGRATIONS="
20260617180000_add_admin_settings
20260617230000_add_article_studio_seo_intelligence
20260630000000_baseline
"

run_deploy() {
  $PRISMA migrate deploy
}

baseline_legacy() {
  echo "Baselining existing production schema (P3005)..."
  for migration in $BASELINE_MIGRATIONS; do
    echo "  -> resolve --applied $migration"
    $PRISMA migrate resolve --applied "$migration"
  done
}

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set; skipping migrations."
  exit 0
fi

echo "Applying Prisma migrations (migrate deploy)..."
set +e
deploy_output=$(run_deploy 2>&1)
deploy_status=$?
set -e

printf '%s\n' "$deploy_output"

if [ "$deploy_status" -eq 0 ]; then
  echo "Prisma migrations applied."
  exit 0
fi

if printf '%s' "$deploy_output" | grep -q "P3005"; then
  baseline_legacy
  echo "Retrying migrate deploy after baseline..."
  if run_deploy; then
    echo "Prisma migrations applied after baseline."
    exit 0
  fi
fi

echo "WARNING: prisma migrate deploy failed; continuing startup." >&2
exit 1
