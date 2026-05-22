import '@/lib/auth-env';
import { authEnvStatus } from '@/lib/auth-env';
import { getDeploymentMode } from '@/lib/deployment-mode';

/** Readiness check for Vercel env (no secrets returned). */
export async function GET() {
  const status = authEnvStatus();
  const ok = status.hasSecret && status.hasUrl && status.hasDatabase;
  return Response.json(
    { ok, deploymentMode: getDeploymentMode(), ...status },
    { status: ok ? 200 : 503 },
  );
}
