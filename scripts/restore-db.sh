#!/usr/bin/env bash
# Restore a custom-format dump into a scratch database for proof.
# Usage: ./scripts/restore-db.sh backups/assemble-YYYYMMDD.dump [scratch_db_name]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DUMP="${1:-}"
SCRATCH_DB="${2:-assemble_restore_scratch}"

if [[ -z "$DUMP" || ! -f "$DUMP" ]]; then
  echo "Usage: $0 <dump-file> [scratch_db_name]" >&2
  exit 1
fi

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source <(grep -E '^(DATABASE_URL|DIRECT_URL)=' "$ROOT/.env" | sed 's/\r$//')
  set +a
fi

URL="${DIRECT_URL:-${DATABASE_URL:-}}"
if [[ -z "$URL" ]]; then
  echo "DATABASE_URL or DIRECT_URL required" >&2
  exit 1
fi

# Derive admin URL without database name for CREATE DATABASE
BASE_URL="$(python3 - <<'PY' "$URL"
import sys
from urllib.parse import urlparse, urlunparse
u = urlparse(sys.argv[1])
path = '/postgres'
print(urlunparse((u.scheme, u.netloc, path, '', '', '')))
PY
)"

START="$(date +%s)"
echo "Creating scratch database $SCRATCH_DB"
psql "$BASE_URL" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"$SCRATCH_DB\";"
psql "$BASE_URL" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$SCRATCH_DB\";"

RESTORE_URL="$(python3 - <<'PY' "$URL" "$SCRATCH_DB"
import sys
from urllib.parse import urlparse, urlunparse
u = urlparse(sys.argv[1])
print(urlunparse((u.scheme, u.netloc, '/' + sys.argv[2], '', '', '')))
PY
)"

echo "Restoring $DUMP → $SCRATCH_DB"
pg_restore --no-owner --no-acl --dbname="$RESTORE_URL" "$DUMP"
END="$(date +%s)"
ELAPSED=$((END - START))
echo "Restore completed in ${ELAPSED}s"
echo "Proof: psql \"$RESTORE_URL\" -c 'SELECT COUNT(*) FROM assurance_frameworks;'"
