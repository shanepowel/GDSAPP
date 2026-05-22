#!/usr/bin/env sh
# Run migrations and full seed against the database in .env (or exported vars).
set -e

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

if [ -z "$DATABASE_URL" ] || echo "$DATABASE_URL" | grep -q 'your-neon'; then
  echo "ERROR: Set DATABASE_URL in .env (Neon pooled connection string)." >&2
  echo "See DEPLOY.md → Run migrations." >&2
  exit 1
fi

export DIRECT_URL="${DIRECT_URL:-$DATABASE_URL}"

echo "→ Applying migrations..."
sh scripts/prisma-env.sh migrate deploy

echo "→ Seeding reference data, standards, and demo..."
npm run seed

echo "Done. Demo login: admin@demo.local / demo-password"
