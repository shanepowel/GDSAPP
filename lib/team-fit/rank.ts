/**
 * Picks one suitable candidate per role.
 * A person whose remaining FTE is below the role, or whose fit is below the datum,
 * is not suitable. Tentative assignments are already in `held` and reduce availability.
 * `now` is not used: callers pass the FTE they have already measured.
 */

export interface RankScore {
  personId: string;
  compositeScore: number;
}

export interface RankHold {
  personId: string;
  roleId: string;
  fte: number;
}

export function pickSuitable<T extends RankScore>(input: {
  roles: Array<{ id: string; fteRequired: number }>;
  scoresByRole: ReadonlyMap<string, readonly T[]>;
  /** Available FTE before assignments, typically days per week divided by 5. */
  capacity: ReadonlyMap<string, number>;
  held: readonly RankHold[];
  datum: number;
}): Map<string, T | null> {
  const used = new Map<string, number>();
  for (const hold of input.held) {
    used.set(hold.personId, (used.get(hold.personId) ?? 0) + hold.fte);
  }

  const result = new Map<string, T | null>();
  for (const role of input.roles) {
    const heldHere = input.held.filter((hold) => hold.roleId === role.id);
    let best: T | null = null;
    for (const score of input.scoresByRole.get(role.id) ?? []) {
      if (score.compositeScore < input.datum) continue;
      const cap = input.capacity.get(score.personId) ?? 1;
      const heldOnRole = heldHere
        .filter((hold) => hold.personId === score.personId)
        .reduce((sum, hold) => sum + hold.fte, 0);
      const free = cap - Math.max(0, (used.get(score.personId) ?? 0) - heldOnRole);
      if (free + 1e-9 < role.fteRequired) continue;
      if (!best || score.compositeScore > best.compositeScore) best = score;
    }
    result.set(role.id, best);
    if (best && !heldHere.some((hold) => hold.personId === best.personId)) {
      used.set(best.personId, (used.get(best.personId) ?? 0) + role.fteRequired);
    }
  }
  return result;
}
