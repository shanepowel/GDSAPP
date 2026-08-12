import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { runFreshnessDecay } from '@/lib/assurance/freshness';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cron endpoint for evidence freshness decay.
 * Protect with CRON_SECRET bearer token in production.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await runFreshnessDecay(prisma);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Freshness job failed' }, { status: 500 });
  }
}
