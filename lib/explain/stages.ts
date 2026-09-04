/**
 * Journey stage structure. User-facing sentences live in lib/copy.ts
 * (`copy.journey`) so Welsh can differ without touching components.
 */

export const STAGE_IDS = ['define', 'hold', 'assemble', 'assure', 'run'] as const;
export type StageId = (typeof STAGE_IDS)[number];

export interface StageDef {
  id: StageId;
  number: 1 | 2 | 3 | 4 | 5;
  href: string;
  extraHrefs?: Array<{ href: string; copyKey: 'roles' | 'ceremonies' }>;
  match: RegExp;
  previousId: StageId | null;
  nextId: StageId | null;
}

export const STAGE_DEFS: readonly StageDef[] = [
  {
    id: 'define',
    number: 1,
    href: '/practice',
    extraHrefs: [{ href: '/practice/ceremonies', copyKey: 'ceremonies' }],
    match: /^\/practice(\/|$)/,
    previousId: null,
    nextId: 'hold',
  },
  {
    id: 'hold',
    number: 2,
    href: '/people',
    extraHrefs: [{ href: '/roles', copyKey: 'roles' }],
    match: /^\/(roles|people)(\/|$)/,
    previousId: 'define',
    nextId: 'assemble',
  },
  {
    id: 'assemble',
    number: 3,
    href: '/squads',
    match: /^\/squads(\/|$)/,
    previousId: 'hold',
    nextId: 'assure',
  },
  {
    id: 'assure',
    number: 4,
    href: '/assurance',
    match: /^\/assurance(\/|$)/,
    previousId: 'assemble',
    nextId: 'run',
  },
  {
    id: 'run',
    number: 5,
    href: '/portfolio',
    match: /^\/portfolio(\/|$)/,
    previousId: 'assure',
    nextId: null,
  },
];

export function stageDefForPath(pathname: string): StageDef | null {
  return STAGE_DEFS.find((s) => s.match.test(pathname)) ?? null;
}
