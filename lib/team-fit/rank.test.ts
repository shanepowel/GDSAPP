import { describe, expect, it } from 'vitest';
import { pickSuitable } from '@/lib/team-fit/rank';

describe('pickSuitable', () => {
  const roles = [
    { id: 'research', fteRequired: 1 },
    { id: 'delivery', fteRequired: 1 },
  ];

  it('does not offer a person who is already at 1.0 FTE', () => {
    const scores = [
      { personId: 'dafydd', compositeScore: 0.82 },
      { personId: 'bethan', compositeScore: 0.7 },
    ];
    const picked = pickSuitable({
      roles,
      scoresByRole: new Map([
        ['research', scores],
        ['delivery', scores],
      ]),
      capacity: new Map([
        ['dafydd', 1],
        ['bethan', 1],
      ]),
      held: [{ personId: 'dafydd', roleId: 'research', fte: 1 }],
      datum: 0.6,
    });
    expect(picked.get('research')?.personId).toBe('dafydd');
    expect(picked.get('delivery')?.personId).toBe('bethan');
  });

  it('hides a score below the datum', () => {
    const picked = pickSuitable({
      roles: [{ id: 'research', fteRequired: 1 }],
      scoresByRole: new Map([['research', [{ personId: 'bethan', compositeScore: 0 }]]]),
      capacity: new Map([['bethan', 1]]),
      held: [],
      datum: 0.6,
    });
    expect(picked.get('research')).toBeNull();
  });

  it('does not give the same person to two roles when only 1.0 FTE is free', () => {
    const scores = [{ personId: 'bethan', compositeScore: 0.9 }];
    const picked = pickSuitable({
      roles,
      scoresByRole: new Map([
        ['research', scores],
        ['delivery', scores],
      ]),
      capacity: new Map([['bethan', 1]]),
      held: [],
      datum: 0.6,
    });
    expect(picked.get('research')?.personId).toBe('bethan');
    expect(picked.get('delivery')).toBeNull();
  });
});
