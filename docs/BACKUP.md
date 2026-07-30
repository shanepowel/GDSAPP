# Database backup and restore

## Backup

```bash
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh
```

Writes `backups/assemble-<UTC timestamp>.dump` using `pg_dump` custom format against `DIRECT_URL` (or `DATABASE_URL`).

Suggested cron:

```cron
15 2 * * * cd /path/to/assemble && ./scripts/backup-db.sh >> /var/log/assemble-backup.log 2>&1
```

## Restore proof

```bash
chmod +x scripts/restore-db.sh
./scripts/restore-db.sh backups/assemble-<stamp>.dump assemble_restore_scratch
```

Creates a scratch database, restores into it, and prints elapsed seconds. Drop the scratch DB when finished:

```bash
psql "$DIRECT_URL" -c 'DROP DATABASE IF EXISTS assemble_restore_scratch;'
```

Document the elapsed time from a successful run in the release notes for the compliance pack (Phase 6.8).

## Restore proof (this environment)

| When (UTC) | Dump | Scratch DB | Elapsed |
|---|---|---|---|
| 2026-07-30T09:32:17Z | `assemble-20260730T093217Z.dump` | `assemble_restore_scratch` | **1s** |
