import '@/lib/auth-env';
import { authEnvStatus } from '@/lib/auth-env';
import { isDatabaseSchemaReady } from '@/lib/db/schema-ready';
import { isDemoLoginReady } from '@/lib/demo/demo-account';
import { getDeploymentMode } from '@/lib/deployment-mode';
import { recordPerfSample } from '@/lib/ops/perf-samples';

/** Readiness check for Vercel env (no secrets returned). */
export async function GET() {
  const started = Date.now();
  const status = authEnvStatus();
  const schemaReady = status.hasDatabase ? await isDatabaseSchemaReady() : false;
  const demoLoginReady = schemaReady ? await isDemoLoginReady() : false;
  const ok = status.hasSecret && status.hasUrl && status.hasDatabase && schemaReady;
  recordPerfSample({
    route: '/api/health',
    ok,
    latencyMs: Date.now() - started,
  });
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
