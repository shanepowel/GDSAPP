/**
 * The only legal sizes for library components.
 * Spacing steps match docs/spec/01-design-system.md. Pixel values live in styles/tokens.css.
 * --space-10 is not a component step.
 */

export const SPACE_STEPS = [1, 2, 3, 4, 5, 6, 8] as const;
export type SpaceStep = (typeof SPACE_STEPS)[number];

export const SPACE_PX: Record<SpaceStep, number> = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  8: 48,
};

export function isSpaceStep(value: number): value is SpaceStep {
  return (SPACE_STEPS as readonly number[]).includes(value);
}

export function space(step: SpaceStep): string {
  return `var(--space-${step})`;
}

export const TYPE_ROLES = ['plate', 'section', 'body', 'label', 'meta', 'index', 'ref'] as const;
export type TypeRole = (typeof TYPE_ROLES)[number];

/** CSS variables for each role. Components reference these, not raw pixel sizes. */
export const TYPE_STYLE: Record<
  TypeRole,
  { size: string; weight: string; tracking: string; leading: string }
> = {
  plate: {
    size: 'var(--type-plate-size)',
    weight: 'var(--type-plate-weight)',
    tracking: 'var(--type-plate-tracking)',
    leading: 'var(--type-plate-leading)',
  },
  section: {
    size: 'var(--type-section-size)',
    weight: 'var(--type-section-weight)',
    tracking: 'var(--type-section-tracking)',
    leading: 'var(--type-section-leading)',
  },
  body: {
    size: 'var(--type-body-size)',
    weight: 'var(--type-body-weight)',
    tracking: 'var(--type-body-tracking)',
    leading: 'var(--type-body-leading)',
  },
  label: {
    size: 'var(--type-label-size)',
    weight: 'var(--type-label-weight)',
    tracking: 'var(--type-label-tracking)',
    leading: 'var(--type-label-leading)',
  },
  meta: {
    size: 'var(--type-meta-size)',
    weight: 'var(--type-meta-weight)',
    tracking: 'var(--type-meta-tracking)',
    leading: 'var(--type-meta-leading)',
  },
  index: {
    size: 'var(--type-index-size)',
    weight: 'var(--type-index-weight)',
    tracking: 'var(--type-index-tracking)',
    leading: 'var(--type-index-leading)',
  },
  ref: {
    size: 'var(--type-ref-size)',
    weight: 'var(--type-ref-weight)',
    tracking: 'var(--type-ref-tracking)',
    leading: 'var(--type-ref-leading)',
  },
};

/** Expected token values. The test locks these to styles/tokens.css. */
export const TYPE_PX: Record<TypeRole, { size: number; weight: number }> = {
  plate: { size: 24, weight: 600 },
  section: { size: 17, weight: 600 },
  body: { size: 15, weight: 400 },
  label: { size: 13, weight: 500 },
  meta: { size: 11, weight: 400 },
  index: { size: 40, weight: 500 },
  ref: { size: 12, weight: 500 },
};

export const TARGET_PX = { min: 24, control: 44 } as const;

export const TARGET = {
  min: 'var(--target-min)',
  control: 'var(--target-control)',
} as const;

export const MEASURE = {
  reading: '66ch',
  plate: 'var(--container-max)',
} as const;

export type MeasureWidth = keyof typeof MEASURE;
