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

## 5. Run migrations and seed (after deploy, once)

The Vercel build does **not** run migrations. Do this from your laptop after Neon is created.

### Get two Neon connection strings

1. Open your project in https://console.neon.tech
2. **Dashboard → Connection details**
3. **Pooled connection** (toggle ON) → copy → this is `DATABASE_URL` (for the app on Vercel)
4. **Pooled connection** (toggle OFF) → copy → this is `DIRECT_URL` (for `migrate deploy` only)

Both URLs must include `?sslmode=require` (Neon adds this by default).

Paste them into Vercel environment variables **and** into a local `.env` (do not commit `.env`).

Example shape (yours will differ):

```env
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://user:pass@ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

### Run once

From the project root, with `.env` filled in:

```bash
npm run db:provision
```

That runs `migrate deploy` then `seed` (DDaT fixtures, standards, demo org, NRW engagement).

Or step by step:

```bash
npm run db:deploy
npm run seed
```

Demo login after seed: `admin@demo.local` / `demo-password`

## 7. Verify

- Sign in: `admin@demo.local` / `demo-password`
- Open NRW demo engagement → **Run analysis**
