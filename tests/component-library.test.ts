import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  BUILD_STEPS,
  COMPONENT_GUIDES,
  GDS_PRINCIPLES,
  LIBRARY_COMPONENT_IDS,
  PRINCIPLE_IDS,
  buildStepsFor,
} from '@/components/library/guides';
import { buttonMetrics } from '@/components/library/Button';
import {
  SPACE_PX,
  SPACE_STEPS,
  TARGET,
  TARGET_PX,
  TYPE_PX,
  TYPE_ROLES,
  isSpaceStep,
  space,
} from '@/components/library/sizing';

const tokens = readFileSync(resolve(process.cwd(), 'styles/tokens.css'), 'utf8');

describe('sizing scale', () => {
  it('exposes only the locked spacing steps', () => {
    expect(SPACE_STEPS).toEqual([1, 2, 3, 4, 5, 6, 8]);
    expect(SPACE_PX).toEqual({ 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 8: 48 });
    for (const step of SPACE_STEPS) {
      expect(space(step)).toBe(`var(--space-${step})`);
      expect(tokens).toContain(`--space-${step}: ${SPACE_PX[step]}px;`);
    }
    expect(isSpaceStep(4)).toBe(true);
    expect(isSpaceStep(10)).toBe(false);
    expect(isSpaceStep(7)).toBe(false);
  });

  it('locks type roles and targets to the token file', () => {
    expect(TYPE_ROLES).toEqual(['plate', 'section', 'body', 'label', 'meta', 'index', 'ref']);
    for (const role of TYPE_ROLES) {
      expect(tokens).toContain(`--type-${role}-size: ${TYPE_PX[role].size}px;`);
      expect(tokens).toContain(`--type-${role}-weight: ${TYPE_PX[role].weight};`);
    }
    expect(TARGET_PX).toEqual({ min: 24, control: 44 });
    expect(TARGET.min).toBe('var(--target-min)');
    expect(TARGET.control).toBe('var(--target-control)');
    expect(tokens).toContain('--target-min: 24px;');
    expect(tokens).toContain('--target-control: 44px;');
  });

  it('sizes buttons from the target and the spacing scale', () => {
    expect(buttonMetrics('md').minHeight).toBe('var(--target-control)');
    expect(buttonMetrics('md').paddingInline).toBe('var(--space-4)');
    expect(buttonMetrics('sm').minHeight).toBe('var(--space-6)');
    expect(buttonMetrics('sm').paddingInline).toBe('var(--space-3)');
  });
});

describe('implementation guides', () => {
  it('publishes the ten Government Digital Service design principles', () => {
    expect(GDS_PRINCIPLES.map((principle) => principle.id)).toEqual([...PRINCIPLE_IDS]);
    for (const principle of GDS_PRINCIPLES) {
      expect(principle.nameCy.trim().length).toBeGreaterThan(0);
      expect(principle.statement.trim().length).toBeGreaterThan(0);
      expect(principle.assemble.trim().length).toBeGreaterThan(0);
      expect(principle.serviceStandard.length).toBeGreaterThan(0);
    }
  });

  it('gives every component a guide and a place in the build order', () => {
    expect(COMPONENT_GUIDES.map((guide) => guide.id)).toEqual([...LIBRARY_COMPONENT_IDS]);
    for (const id of LIBRARY_COMPONENT_IDS) {
      const guide = COMPONENT_GUIDES.find((item) => item.id === id);
      expect(guide?.userNeed.length).toBeGreaterThan(0);
      expect(guide?.sizing.length).toBeGreaterThan(0);
      expect(guide?.accessibility.length).toBeGreaterThan(0);
      for (const principleId of guide?.principleIds ?? []) {
        expect(PRINCIPLE_IDS).toContain(principleId);
      }
      expect(buildStepsFor(id).length).toBeGreaterThan(0);
    }
  });

  it('keeps build steps in sheet order and points them at real components', () => {
    expect(BUILD_STEPS.map((step) => step.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    for (const step of BUILD_STEPS) {
      for (const id of step.componentIds) {
        expect(LIBRARY_COMPONENT_IDS).toContain(id);
      }
      for (const principleId of step.principleIds) {
        expect(PRINCIPLE_IDS).toContain(principleId);
      }
      expect(step.doneWhen.length).toBeGreaterThan(0);
    }
  });

  it('does not hardcode a criterion count', () => {
    const blob = JSON.stringify({ GDS_PRINCIPLES, COMPONENT_GUIDES, BUILD_STEPS });
    expect(blob).not.toContain('14 points');
    expect(blob).not.toMatch(/\b14 criteria\b/);
  });
});
