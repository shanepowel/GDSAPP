# Deploy to Vercel

Repository: https://github.com/shanepowel/GDSAPP

Database: **[Neon](https://neon.tech) Postgres** — see [docs/NEON.md](docs/NEON.md).

## 1. Import project

1. Open https://vercel.com/new
2. Import **shanepowel/GDSAPP**
3. Framework preset: **Next.js**
4. Root directory: `.` (default)
5. Build command (from `vercel.json`): `prisma generate && next build` (migrations are **not** run at build time)
6. Region: **London (lhr1)** in `vercel.json` (use a Neon project in EU when possible)

## 2. Neon Postgres

1. Create a project at https://console.neon.tech
2. **Connection details** → copy **pooled** and **direct** connection strings
3. Pooled → `DATABASE_URL` (hostname includes `-pooler`)
4. Direct → `DIRECT_URL` (same credentials, host **without** `-pooler`)

Wrap values in double quotes if you store them in `.env` and the URI contains `&`.

Full detail: [docs/NEON.md](docs/NEON.md).

## 3. Environment variables (Vercel)

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string (migrations only) |
| `NEXTAUTH_SECRET` or `AUTH_SECRET` | `openssl rand -base64 32` (required) |
| `NEXTAUTH_URL` or `AUTH_URL` | `https://<your-vercel-domain>` (exact URL, no trailing slash) |

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

Or step by step:

```bash
npm run db:deploy
npm run seed
```

Demo login after seed: `admin@demo.local` / `demo-password`

## 6. Verify

- Sign in: `admin@demo.local` / `demo-password`
- Open NRW demo engagement → **Run analysis**

## Local alternative: Docker Postgres

```bash
docker compose up -d
cp .env.example .env
npm run db:migrate
npm run seed
npm run dev
```
