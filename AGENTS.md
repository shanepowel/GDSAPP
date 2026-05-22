<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Services

| Service | How to start | Notes |
|---------|-------------|-------|
| PostgreSQL 16 | `docker compose up -d` (from repo root) | Must be running before migrations or dev server |
| Next.js dev server | `npm run dev` | Runs on `http://localhost:3000` |

### Environment setup

- Copy `.env.example` to `.env` and set `AUTH_SECRET` / `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`). All other local defaults work with the Docker Postgres.
- Docker daemon must be started (`sudo dockerd &`) before `docker compose up -d` in Cloud Agent VMs.
- The `prisma-env.sh` wrapper sometimes fails to propagate `DIRECT_URL` from `.env`; if `npm run db:migrate` errors with "empty DIRECT_URL", export both `DATABASE_URL` and `DIRECT_URL` explicitly before running Prisma commands.

### Common commands

See `README.md` and `package.json` scripts. Key commands:

- **Migrate:** `npx prisma migrate dev` (with `DATABASE_URL` and `DIRECT_URL` exported)
- **Seed:** `npm run seed` (runs ingest + seed:standards + seed:demo)
- **Unit tests:** `npm test` (Vitest, 9 tests)
- **E2E tests:** `npm run test:e2e` (Playwright + axe; requires `npx playwright install` first)
- **Lint:** `npm run lint` (ESLint; 2 pre-existing errors in repo)
- **Typecheck:** `npm run typecheck`

### Demo credentials

`admin@demo.local` / `demo-password` (seeded by `npm run seed:demo`)
