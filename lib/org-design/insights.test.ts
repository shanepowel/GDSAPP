import { describe, expect, it } from 'vitest';
import { computeInsights, structureReadinessHints } from '@/lib/org-design/insights';
import { ORG_TEMPLATES, suggestDdatRoleId } from '@/lib/org-design/templates';
import type {
  DesignGraphAssignment,
  DesignGraphEntity,
  DesignGraphPerson,
  DesignGraphRelationship,
} from '@/lib/org-design/types';

function materialiseTemplate(templateId: string): {
  entities: DesignGraphEntity[];
  relationships: DesignGraphRelationship[];
  people: DesignGraphPerson[];
  assignments: DesignGraphAssignment[];
} {
  const template = ORG_TEMPLATES.find((t) => t.id === templateId)!;
  const idMap = new Map<string, string>();
  template.entities.forEach((e, i) => idMap.set(e.tempId, `e${i}`));
  const entities: DesignGraphEntity[] = template.entities.map((e, i) => ({
    id: `e${i}`,
    name: e.name,
    type: e.type,
    purpose: e.purpose ?? null,
    domain: e.domain ?? null,
    accountabilities: e.accountabilities ?? [],
    policies: e.policies ?? [],
    parentId: e.parentTempId ? (idMap.get(e.parentTempId) ?? null) : null,
    ddatRoleId: e.ddatRoleId ?? null,
  }));
  const relationships: DesignGraphRelationship[] = template.relationships.map((r, i) => ({
    id: `r${i}`,
    sourceId: idMap.get(r.sourceTempId)!,
    targetId: idMap.get(r.targetTempId)!,
    type: r.type,
  }));
  return { entities, relationships, people: [], assignments: [] };
}

describe('org-design insights', () => {
  it('scores a GDS service team template', () => {
    const graph = materialiseTemplate('gds-service-team');
    const insights = computeInsights(graph);
    expect(insights.totals.entities).toBeGreaterThan(8);
    expect(insights.totals.roles).toBeGreaterThan(5);
    expect(insights.healthScore).toBeGreaterThan(0);
    // Unstaffed roles should surface
    expect(insights.totals.vacancies).toBe(insights.totals.roles);
  });

  it('flags missing GDS roles on a thin hierarchy', () => {
    const insights = computeInsights({
      entities: [
        {
          id: '1',
          name: 'Service',
          type: 'circle',
          purpose: 'Run service',
          domain: null,
          accountabilities: ['Outcomes'],
          policies: [],
          parentId: null,
        },
        {
          id: '2',
          name: 'Developer',
          type: 'role',
          purpose: 'Build',
          domain: null,
          accountabilities: [],
          policies: [],
          parentId: '1',
        },
      ],
      relationships: [],
      people: [],
      assignments: [],
    });
    const gdsIssues = insights.issues.filter((i) => i.category === 'gds');
    expect(gdsIssues.length).toBeGreaterThan(0);
    const hints = structureReadinessHints(insights);
    expect(hints.length).toBeGreaterThan(0);
  });
});

describe('GDS templates', () => {
  it('includes core GDS and Wales templates', () => {
    const ids = ORG_TEMPLATES.map((t) => t.id);
    expect(ids).toContain('gds-service-team');
    expect(ids).toContain('wales-dss-team');
    expect(ids).toContain('assessment-skeleton');
  });

  it('maps common role names to DDaT ids', () => {
    expect(suggestDdatRoleId('Product Manager')).toBe('product-manager');
    expect(suggestDdatRoleId('User Researcher')).toBe('user-researcher');
    expect(suggestDdatRoleId('Delivery Manager')).toBe('delivery-manager');
    expect(suggestDdatRoleId('Random Title')).toBeNull();
  });

  it('embeds ddatRoleId on GDS service team roles', () => {
    const template = ORG_TEMPLATES.find((t) => t.id === 'gds-service-team')!;
    const mapped = template.entities.filter((e) => e.type === 'role' && e.ddatRoleId);
    expect(mapped.length).toBeGreaterThanOrEqual(6);
  });
});
