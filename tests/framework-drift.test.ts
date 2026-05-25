import { describe, expect, it } from 'vitest';
import {
  compareFrameworkSnapshots,
  hashFrameworkPoints,
  type FrameworkPointSnapshot,
} from '@/lib/framework/drift';

const base: FrameworkPointSnapshot[] = [
  {
    id: 'wales-1',
    standardId: 'wales',
    number: 1,
    title: 'User needs',
    description: 'Understand user needs.',
  },
];

describe('framework drift', () => {
  it('detects modified points', () => {
    const current = [{ ...base[0], title: 'User needs (updated)' }];
    const changes = compareFrameworkSnapshots(current, base);
    expect(changes.some((c) => c.kind === 'modified')).toBe(true);
  });

  it('stable hash for identical snapshots', () => {
    const h1 = hashFrameworkPoints(base);
    const h2 = hashFrameworkPoints([...base]);
    expect(h1).toBe(h2);
  });
});
