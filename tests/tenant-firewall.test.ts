import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

describe('tenant-firewall', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.DEPLOYMENT_MODE;
    delete process.env.NEXT_PUBLIC_DEPLOYMENT_MODE;
  });

  it('assertPlayAOnly blocks client instance', async () => {
    process.env.DEPLOYMENT_MODE = 'client';
    const { assertPlayAOnly } = await import('@/lib/tenant-firewall');
    expect(() => assertPlayAOnly('Bid outlook')).toThrow(TRPCError);
  });

  it('assertNotCompetitorSubject blocks bid_question on client', async () => {
    process.env.DEPLOYMENT_MODE = 'client';
    const { assertNotCompetitorSubject } = await import('@/lib/tenant-firewall');
    expect(() => assertNotCompetitorSubject('bid_question')).toThrow(TRPCError);
  });
});
