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

## 3. Deployment mode (two instances)

See [docs/DEPLOYMENT-MODES.md](docs/DEPLOYMENT-MODES.md). Use **two Vercel projects** and **two Neon databases**:

- **Internal:** `DEPLOYMENT_MODE=internal` and `NEXT_PUBLIC_DEPLOYMENT_MODE=internal`
- **Client (NRW):** `DEPLOYMENT_MODE=client` and `NEXT_PUBLIC_DEPLOYMENT_MODE=client`

## 4. Environment variables (Vercel)

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string (migrations only) |
| `NEXTAUTH_SECRET` or `AUTH_SECRET` | `openssl rand -base64 32` (required) |
| `NEXTAUTH_URL` or `AUTH_URL` | `https://<your-vercel-domain>` (exact URL, no trailing slash) |
| `AUTH_MICROSOFT_ENTRA_ID_*` | Optional Entra ID SSO (see `.env.example`) |
| `NEXT_PUBLIC_ENTRA_ENABLED` | Set `true` when Entra app is registered to show Microsoft sign-in |

Organisations are stamped with `deploymentMode` on create; `protectedProcedure` rejects cross-instance sign-in (Play A org on Play B URL, etc.).

After `db:deploy`, approval chains use `/engagements/[id]/reviews`.

## 5. First deploy

Deploy from Vercel UI or:

```bash
npx vercel login
npx vercel link
npx vercel env pull .env.local
npx vercel deploy --prod
```

## 6. Run migrations and seed (after deploy, once)

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

## 7. Verify

After setting env vars, **Redeploy** from the Vercel dashboard (env changes do not apply until redeploy).

Check configuration (no secrets returned):

`https://<your-vercel-domain>/api/health` → `{"ok":true,"deploymentMode":"client","hasSecret":true,"hasUrl":true,"hasDatabase":true}`

Then:

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
