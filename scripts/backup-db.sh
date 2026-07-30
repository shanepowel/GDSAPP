#!/usr/bin/env bash
# Backup Assemble PostgreSQL to backups/ with timestamp.
# Usage: ./scripts/backup-db.sh
# Cron example (daily 02:15): 15 2 * * * cd /path/to/assemble && ./scripts/backup-db.sh >> /var/log/assemble-backup.log 2>&1
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  set -a
  # Prefer DIRECT_URL for dumps (non-pooled)
  # shellcheck disable=SC1091
  source <(grep -E '^(DATABASE_URL|DIRECT_URL)=' .env | sed 's/\r$//')
  set +a
fi

URL="${DIRECT_URL:-${DATABASE_URL:-}}"
if [[ -z "$URL" ]]; then
  echo "DATABASE_URL or DIRECT_URL required" >&2
  exit 1
fi

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="${BACKUP_DIR:-$ROOT/backups}"
mkdir -p "$OUT_DIR"
OUT="$OUT_DIR/assemble-$STAMP.dump"

echo "Backing up to $OUT"
pg_dump --format=custom --no-owner --no-acl --dbname="$URL" --file="$OUT"
ls -lh "$OUT"
echo "OK"
