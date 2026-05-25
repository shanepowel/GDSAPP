import '@/lib/auth-env';
import { authEnvStatus } from '@/lib/auth-env';
import { isDatabaseSchemaReady } from '@/lib/db/schema-ready';
import { isDemoLoginReady } from '@/lib/demo/demo-account';
import { getDeploymentMode } from '@/lib/deployment-mode';

/** Readiness check for Vercel env (no secrets returned). */
export async function GET() {
  const status = authEnvStatus();
  const schemaReady = status.hasDatabase ? await isDatabaseSchemaReady() : false;
  const demoLoginReady = schemaReady ? await isDemoLoginReady() : false;
  const ok = status.hasSecret && status.hasUrl && status.hasDatabase && schemaReady;
  return Response.json(
    {
      ok,
      deploymentMode: getDeploymentMode(),
      schemaReady,
      demoLoginReady,
      ...status,
    },
    { status: ok ? 200 : 503 },
  );
}
