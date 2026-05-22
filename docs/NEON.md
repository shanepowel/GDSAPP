# Neon Postgres with Assemble

## Two URLs

| Variable | Neon dashboard | Hostname |
|----------|----------------|----------|
| `DATABASE_URL` | **Pooled connection** (toggle ON) | `…-pooler.….neon.tech` |
| `DIRECT_URL` | **Pooled connection** (toggle OFF) | `….neon.tech` (no `-pooler`) |

Your pooled URL is correct for `DATABASE_URL`. For migrations, remove `-pooler` from the host for `DIRECT_URL`.

## `.env` on your laptop

**Quote the URLs** when they contain `&`, or `source .env` will break at the first `&`:

```env
DATABASE_URL="postgresql://…@ep-xxx-pooler.region.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
DIRECT_URL="postgresql://…@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

Then:

```bash
npm run db:provision
```

## Vercel

Paste the **same two quoted values** into Vercel environment variables (Production). Redeploy after saving.

Also set `AUTH_SECRET` and `AUTH_URL` (see `DEPLOY.md`).

## Security

If a database URL was shared in chat or committed, **rotate the Neon role password** in the Neon console and update Vercel + local `.env`.
