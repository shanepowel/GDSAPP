# Supabase Postgres with Assemble

Assemble uses Prisma with two connection strings. Supabase needs **both** for serverless (Vercel) plus migrations.

## 1. Get connection strings

In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Project Settings** → **Database**:

| Use | Supabase setting | Env var | Port |
|-----|------------------|---------|------|
| App (Vercel, `Prisma Client`) | **Connection pooling** → URI → mode **Transaction** | `DATABASE_URL` | 6543 |
| Migrations (`migrate deploy`) | **Connection string** → URI (direct) | `DIRECT_URL` | 5432 |

Add `?pgbouncer=true` to the **pooled** URL if the dashboard does not include it (required for Transaction pooler with Prisma).

Example shape (replace password and project ref):

```env
# Pooled — for the running app on Vercel
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct — for migrations only (npm run db:provision)
DIRECT_URL=postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:5432/postgres
```

If the password contains `@`, `#`, or `%`, [URL-encode](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding) it in the connection string.

## 2. Vercel environment variables

Set for **Production** (and Preview if you use preview DBs):

- `DATABASE_URL` — pooled (Transaction, port 6543)
- `DIRECT_URL` — direct (port 5432)
- `NEXTAUTH_SECRET` or `AUTH_SECRET`
- `NEXTAUTH_URL` or `AUTH_URL` — e.g. `https://your-app.vercel.app`

Redeploy after changing env vars.

## 3. Apply schema and seed (once)

On your laptop, copy the same URLs into `.env` (never commit `.env`):

```bash
npm install
npm run db:provision
```

That runs `prisma migrate deploy` (via `DIRECT_URL`) then `npm run seed`.

Demo login: `admin@demo.local` / `demo-password`

## 4. Common issues

| Symptom | Fix |
|---------|-----|
| "problem with the server configuration" | Set `AUTH_SECRET` / `NEXTAUTH_SECRET` and `AUTH_URL` / `NEXTAUTH_URL` (see `DEPLOY.md`) |
| `Can't reach database server` on Vercel | Use **pooled** `DATABASE_URL` (6543), not direct 5432, for the app |
| Migration errors / timeout | Use **direct** `DIRECT_URL` (5432) for `db:provision`; do not use `pgbouncer=true` on `DIRECT_URL` |
| `prepared statement` errors | Ensure pooled URL has `?pgbouncer=true` |
| IPv6 / connection refused from Vercel | Supabase → Database → enable **IPv4 add-on** or use pooler hostname |

## 5. Local dev with Supabase (optional)

You can point local `.env` at a Supabase **dev** project instead of Docker:

```bash
# Same DATABASE_URL + DIRECT_URL as above
npm run db:provision
npm run dev
```

Or keep local Postgres via `docker compose up -d` and use the URLs in `.env.example` for `DATABASE_URL` / `DIRECT_URL`.
