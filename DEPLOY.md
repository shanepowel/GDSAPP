# Deploy to Vercel

Repository: https://github.com/shanepowel/GDSAPP

## 1. Import project

1. Open https://vercel.com/new
2. Import **shanepowel/GDSAPP**
3. Framework preset: **Next.js**
4. Root directory: `.` (default)
5. Build command (from `vercel.json`): `prisma generate && next build` (migrations are **not** run at build time)
6. Region: **London (lhr1)** — match Neon UK/EU if used

## 2. Environment variables

Add in Vercel → Project → Settings → Environment Variables:

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Postgres connection string (Neon: **pooled**) |
| `DIRECT_URL` | Optional: Neon **unpooled** URL for migrations. If omitted, the build uses `DATABASE_URL` (fine for Docker; on Neon set both explicitly). |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://<your-vercel-domain>` |

## 3. Neon Postgres

1. Create a project in https://neon.tech (UK or EU region)
2. Copy pooled and direct URLs into Vercel

## 4. First deploy

Deploy from Vercel UI or:

```bash
npx vercel login
npx vercel link   # select GDSAPP project
npx vercel env pull .env.local
npx vercel deploy --prod
```

## 5. Run migrations (after deploy, once per schema change)

The Vercel build does not run `migrate deploy` (no database during build). From your machine with production env vars loaded:

```bash
export DATABASE_URL="your-neon-pooled-url"
export DIRECT_URL="your-neon-unpooled-url"   # required for Neon; can match DATABASE_URL for non-pooled Postgres
npm run db:deploy
```

On Neon, use the **unpooled** connection string for `DIRECT_URL`, not the pooler URL.

## 6. Seed production (once)

From a machine with production `DATABASE_URL`:

```bash
npm run seed
```

Or run as a one-off job in Vercel / locally against the production database.

## 7. Verify

- Sign in: `admin@demo.local` / `demo-password`
- Open NRW demo engagement → **Run analysis**
