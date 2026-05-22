#!/usr/bin/env sh
# Prisma requires DIRECT_URL when directUrl is set in schema.prisma.
# Default to DATABASE_URL so Vercel/local work with a single connection string.
export DIRECT_URL="${DIRECT_URL:-$DATABASE_URL}"
exec npx prisma "$@"
