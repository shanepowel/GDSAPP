import { describe, expect, it } from 'vitest';
import { CEREMONIES } from '@/lib/practice';
import { PILLAR_BRIDGE, SIGNAL_BRIDGE, ceremonyForSignal } from '@/lib/bridge/gds';
import type { RigourSignalType } from '@/lib/scoring/fit';

const SIGNAL_TYPES: RigourSignalType[] = [
  'sustained_assignment',
  'capacity_discipline',
  'nfr_planning',
  'spike_discipline',
  'assurance_participation',
  'handover_quality',
];

describe('GDS bridge', () => {
  it('maps every pillar', () => {
    expect(Object.keys(PILLAR_BRIDGE)).toEqual([
      'The Forge',
      'Squad Blueprint',
      'The Keel',
      'DevOps Spec',
      'Delivery Compass',
    ]);
  });

  it('maps every rigour signal type', () => {
    for (const type of SIGNAL_TYPES) {
      expect(SIGNAL_BRIDGE[type].gdsPoints.length).toBeGreaterThan(0);
    }
  });

  it('uses the same signal identifiers as the ceremonies table', () => {
    const ceremonySignals = CEREMONIES.map((c) => c.signal).filter((s): s is RigourSignalType => Boolean(s));
    for (const signal of ceremonySignals) {
      expect(SIGNAL_TYPES).toContain(signal);
      expect(ceremonyForSignal(signal)).toBeTruthy();
    }
  });
});
