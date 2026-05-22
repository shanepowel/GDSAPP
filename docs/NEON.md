# Neon Postgres with Assemble

Assemble uses Prisma with **two** Neon connection strings: pooled for the app (Vercel/serverless), direct for migrations.

## 1. Get connection strings

In [Neon Console](https://console.neon.tech) → your project → **Dashboard → Connection details**:

| Use | Neon setting | Env var | Host pattern |
|-----|--------------|---------|--------------|
| App (Vercel, Prisma Client) | **Pooled connection** (toggle **ON**) | `DATABASE_URL` | `ep-…-pooler.….neon.tech` |
| Migrations (`migrate deploy`) | **Pooled connection** (toggle **OFF**) | `DIRECT_URL` | `ep-….neon.tech` (no `-pooler`) |

Both URLs use the same user, password, and database name (`neondb` by default). Neon usually appends `?sslmode=require` (and sometimes `channel_binding=require`).

Example shape (replace with your project values):

```env
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
DIRECT_URL="postgresql://neondb_owner:PASSWORD@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

**Quote each URL in double quotes** in `.env` when it contains `&`, or shell `source` will truncate the string.

URL-encode special characters in the password (`@`, `#`, `%`).

## 2. Vercel environment variables

Set for **Production** (and Preview if you use a separate Neon branch):

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Pooled URI (`-pooler` host) |
| `DIRECT_URL` | Direct URI (no `-pooler`) |
| `NEXTAUTH_SECRET` or `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` or `AUTH_URL` | `https://your-app.vercel.app` |

Redeploy after changing env vars. Region `lhr1` in `vercel.json` works well with Neon **EU** projects; US Neon endpoints are also fine.

## 3. Apply schema and seed (once)

On your laptop, copy the same URLs into `.env` (never commit `.env`):

```bash
npm install
npm run db:provision
```

That runs `prisma migrate deploy` via `DIRECT_URL`, then `npm run seed`.

Demo login: `admin@demo.local` / `demo-password`

## 4. Common issues

| Symptom | Fix |
|---------|-----|
| Prisma hits `localhost:5432` | Unquoted `&` in `.env` — wrap `DATABASE_URL` and `DIRECT_URL` in quotes |
| "problem with the server configuration" | Set `AUTH_SECRET` / `NEXTAUTH_URL` (see `DEPLOY.md`) |
| `Can't reach database server` on Vercel | `DATABASE_URL` must be the **pooled** URL, not direct |
| Migration timeout / errors | Use **direct** `DIRECT_URL` for `db:provision`, not the pooler host |
| Connection limit on serverless | Do not use direct URL as `DATABASE_URL` in production |

## 5. Local development options

**Docker (default in `.env.example`):**

```bash
docker compose up -d
cp .env.example .env
npm run db:migrate
npm run seed
npm run dev
```

**Neon for local dev:** point `.env` at the same Neon project (or a second Neon project) with pooled + direct URLs, then `npm run db:provision` and `npm run dev`.

## 6. Security

If a connection string was shared in chat or committed, **reset the Neon role password** in the console and update Vercel + local `.env`.
