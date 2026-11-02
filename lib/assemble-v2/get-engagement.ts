import { notFound } from 'next/navigation';
import { engagementById } from './demo-data';

/** Data access seam for engagement screens. Swap the body for a tRPC/Prisma call when wiring. */
export async function getEngagement(id: string) {
  const e = engagementById(id);
  if (!e) notFound();
  return e;
}
