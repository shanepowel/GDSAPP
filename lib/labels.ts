import { lifecycleStageForPhase } from '@/lib/attention/lifecycle';

/** Phase and role labels shown in the product. Stored ids stay lowercase. */
export function displayLabel(value: string | null | undefined, missing = '—'): string {
  const text = value?.trim();
  if (!text) return missing;
  if (text[0] === text[0]?.toUpperCase()) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function phaseDisplay(
  phase: string | null | undefined,
  labels: Record<string, string>,
  missing = '—',
): string {
  const stage = lifecycleStageForPhase(phase);
  if (stage && labels[stage]) return labels[stage];
  return displayLabel(phase, missing);
}

/** Full standard name. Unknown ids stay blank rather than defaulting to GDS. */
export function standardDisplayName(
  standardId: string | null | undefined,
  names: { wales: string; gds: string; missing: string },
): string {
  if (standardId === 'wales') return names.wales;
  if (standardId === 'gds') return names.gds;
  return names.missing;
}

/** System archetype that matches the engagement phase. Null when the phase is unknown. */
export function archetypeSlugForPhase(phase: string | null | undefined): string | null {
  switch (phase?.toLowerCase()) {
    case 'discovery':
    case 'shape':
      return 'discovery-squad';
    case 'alpha':
      return 'alpha-squad';
    case 'beta':
    case 'live':
    case 'operate':
    case 'gate':
      return 'beta-live-squad';
    default:
      return null;
  }
}

const MATURITY = ['practising', 'evidenced', 'assured', 'compounding'] as const;

export function maturityIndex(level: string | number | null | undefined): number | null {
  if (typeof level === 'number' && level >= 1 && level <= 4) return level;
  if (typeof level !== 'string') return null;
  const index = MATURITY.indexOf(level as (typeof MATURITY)[number]);
  return index >= 0 ? index + 1 : null;
}
