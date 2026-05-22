import '@/lib/auth-env';
import { authEnvStatus } from '@/lib/auth-env';

/** Readiness check for Vercel env (no secrets returned). */
export async function GET() {
  const status = authEnvStatus();
  const ok = status.hasSecret && status.hasUrl && status.hasDatabase;
  return Response.json(
    { ok, ...status },
    { status: ok ? 200 : 503 },
  );
}
