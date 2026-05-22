# Deploy to Vercel

Repository: https://github.com/shanepowel/GDSAPP

Database: **Supabase Postgres** (see [docs/SUPABASE.md](docs/SUPABASE.md) for connection strings and troubleshooting).

## 1. Import project

1. Open https://vercel.com/new
2. Import **shanepowel/GDSAPP**
3. Framework preset: **Next.js**
4. Root directory: `.` (default)
5. Build command (from `vercel.json`): `prisma generate && next build` (migrations are **not** run at build time)
6. Region: **London (lhr1)** — pair with a Supabase project in **EU (London)** if possible

## 2. Environment variables

Add in Vercel → Project → Settings → Environment Variables:

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Supabase **Connection pooling** (Transaction mode, port **6543**). Include `?pgbouncer=true` if not in the URI. |
| `DIRECT_URL` | Supabase **direct** connection (port **5432**) for migrations only. |
| `NEXTAUTH_SECRET` or `AUTH_SECRET` | `openssl rand -base64 32` (required) |
| `NEXTAUTH_URL` or `AUTH_URL` | `https://<your-vercel-domain>` (exact live URL, no trailing slash) |

## 3. Supabase setup

1. Create a project at https://supabase.com/dashboard
2. **Project Settings → Database** → copy pooled and direct URIs (see [docs/SUPABASE.md](docs/SUPABASE.md))
3. Paste into Vercel and into a local `.env` for the one-off provision step

## 4. First deploy

Deploy from Vercel UI or:

```bash
npx vercel login
npx vercel link
npx vercel env pull .env.local
npx vercel deploy --prod
```

## 5. Run migrations and seed (after deploy, once)

The Vercel build does **not** run migrations. From your laptop with `.env` filled in:

```bash
npm run db:provision
```

That runs `migrate deploy` (uses `DIRECT_URL`) then `seed`.

Or step by step:

```bash
npm run db:deploy
npm run seed
```

Demo login after seed: `admin@demo.local` / `demo-password`

## 6. Verify

- Sign in: `admin@demo.local` / `demo-password`
- Open NRW demo engagement → **Run analysis**

## Alternative: local Docker Postgres

```bash
docker compose up -d
cp .env.example .env
# DATABASE_URL and DIRECT_URL both point at localhost:5432
npm run db:migrate
npm run seed
```

## Neon (pooled + direct)

1. Neon dashboard → **Connection details**
2. **Pooled** → `DATABASE_URL` (hostname contains `-pooler`)
3. **Unpooled** → `DIRECT_URL` (same user/password, host without `-pooler`)
4. Wrap both in **double quotes** in `.env` if the string contains `&`

See [docs/NEON.md](docs/NEON.md).
