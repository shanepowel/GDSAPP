#!/usr/bin/env sh
# Run migrations and full seed against the database in .env (or exported vars).
set -e

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  # Quote URLs in .env (Neon uses & in query string — unquoted values break `source`).
  . ./.env
  set +a
fi

if [ -z "$DATABASE_URL" ] || echo "$DATABASE_URL" | grep -qE 'your-neon|\[password\]|\[YOUR-PASSWORD\]'; then
  echo "ERROR: Set DATABASE_URL and DIRECT_URL in .env (Supabase pooled + direct URIs)." >&2
  echo "See docs/SUPABASE.md" >&2
  exit 1
fi

if [ -z "$DIRECT_URL" ]; then
  echo "WARN: DIRECT_URL not set; using DATABASE_URL for migrations (OK for Docker, not ideal for Supabase)." >&2
fi

export DIRECT_URL="${DIRECT_URL:-$DATABASE_URL}"

echo "→ Applying migrations..."
sh scripts/prisma-env.sh migrate deploy

echo "→ Seeding reference data, standards, and demo..."
npm run seed

echo "Done. Demo login: admin@demo.local / demo-password"
