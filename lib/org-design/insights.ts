import type {
  DesignGraphAssignment,
  DesignGraphEntity,
  DesignGraphPerson,
  DesignGraphRelationship,
} from '@/lib/org-design/types';

export interface OrgIssue {
  id: string;
  severity: 'high' | 'medium' | 'low';
  category: 'orphan' | 'span' | 'spof' | 'unstaffed' | 'depth' | 'duplicate' | 'isolated' | 'gds';
  title: string;
  description: string;
  entityId?: string;
  /** Optional GDS / Wales standard point ids this issue may put at risk */
  standardPointHints?: string[];
}

export interface OrgInsights {
  totals: {
    entities: number;
    circles: number;
    roles: number;
    products: number;
    relationships: number;
    people: number;
    assignments: number;
    vacancies: number;
  };
  spanOfControl: {
    average: number;
    max: number;
    distribution: Record<string, number>;
  };
  hierarchyDepth: number;
  coverage: {
    entitiesWithPurpose: number;
    entitiesWithAccountabilities: number;
    rolesStaffed: number;
    rolesTotal: number;
  };
  healthScore: number;
  issues: OrgIssue[];
}

const GDS_ROLE_ALIASES: Record<string, { labels: string[]; pointHints: string[] }> = {
  'product-manager': {
    labels: ['product manager', 'product owner', 'po'],
    pointHints: ['gds-1', 'gds-9', 'wales-1'],
  },
  'delivery-manager': {
    labels: ['delivery manager', 'scrum master', 'dm'],
    pointHints: ['gds-5', 'gds-12', 'wales-5'],
  },
  'user-researcher': {
    labels: ['user researcher', 'research'],
    pointHints: ['gds-1', 'gds-2', 'wales-1'],
  },
  'service-designer': {
    labels: ['service designer', 'interaction designer', 'designer'],
    pointHints: ['gds-4', 'gds-6', 'wales-4'],
  },
  'content-designer': {
    labels: ['content designer', 'content'],
    pointHints: ['gds-4', 'wales-4'],
  },
  'service-owner': {
    labels: ['service owner', 'service manager'],
    pointHints: ['gds-11', 'wales-11'],
  },
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

export function computeInsights(data: {
  entities: DesignGraphEntity[];
  relationships: DesignGraphRelationship[];
  people: DesignGraphPerson[];
  assignments: DesignGraphAssignment[];
}): OrgInsights {
  const { entities, relationships, people, assignments } = data;
  const issues: OrgIssue[] = [];
  const entityMap = new Map(entities.map((e) => [e.id, e]));

  const reportsTo = relationships.filter((r) => r.type === 'reports-to');
  const reportsByTarget = new Map<string, number>();
  reportsTo.forEach((r) =>
    reportsByTarget.set(r.targetId, (reportsByTarget.get(r.targetId) || 0) + 1),
  );
  const spans = Array.from(reportsByTarget.values());
  const avgSpan = spans.length ? spans.reduce((a, b) => a + b, 0) / spans.length : 0;
  const maxSpan = spans.length ? Math.max(...spans) : 0;
  const dist: Record<string, number> = { '0': entities.length - reportsByTarget.size };
  spans.forEach((s) => {
    const bucket = s >= 10 ? '10+' : s >= 7 ? '7-9' : s >= 4 ? '4-6' : s >= 1 ? '1-3' : '0';
    dist[bucket] = (dist[bucket] || 0) + 1;
  });

  reportsByTarget.forEach((count, targetId) => {
    if (count > 8) {
      const t = entityMap.get(targetId);
      issues.push({
        id: `span-${targetId}`,
        severity: count > 12 ? 'high' : 'medium',
        category: 'span',
        title: `${t?.name || 'Entity'} has ${count} direct reports`,
        description:
          'A span of control above 8 makes effective management hard. Consider introducing a layer or splitting responsibilities.',
        entityId: targetId,
      });
    }
  });

  let maxDepth = 0;
  function depth(id: string, visited = new Set<string>()): number {
    if (visited.has(id)) return 0;
    visited.add(id);
    const e = entityMap.get(id);
    if (!e) return 0;
    if (!e.parentId) return 1;
    return 1 + depth(e.parentId, visited);
  }
  entities.forEach((e) => {
    maxDepth = Math.max(maxDepth, depth(e.id));
  });
  if (maxDepth > 5) {
    issues.push({
      id: 'depth-deep',
      severity: 'medium',
      category: 'depth',
      title: `Hierarchy is ${maxDepth} levels deep`,
      description: 'Deep hierarchies slow decisions. Consider flattening the structure.',
    });
  }

  const connectedIds = new Set<string>();
  relationships.forEach((r) => {
    connectedIds.add(r.sourceId);
    connectedIds.add(r.targetId);
  });
  entities.forEach((e) => {
    if (!connectedIds.has(e.id) && !e.parentId && entities.length > 1) {
      issues.push({
        id: `orphan-${e.id}`,
        severity: 'low',
        category: 'orphan',
        title: `${e.name} has no connections`,
        description: "This entity isn't connected to anything. Add a parent or relationship.",
        entityId: e.id,
      });
    }
  });

  reportsByTarget.forEach((count, id) => {
    if (count >= 5) {
      const t = entityMap.get(id);
      if (t?.type === 'role') {
        issues.push({
          id: `spof-${id}`,
          severity: 'medium',
          category: 'spof',
          title: `${t.name} is a single point of failure`,
          description: `${count} entities depend on this role. Consider distributing responsibility.`,
          entityId: id,
        });
      }
    }
  });

  const assignedEntityIds = new Set(assignments.map((a) => a.entityId));
  const roles = entities.filter((e) => e.type === 'role');
  const unstaffed = roles.filter((r) => !assignedEntityIds.has(r.id));
  unstaffed.forEach((r) => {
    issues.push({
      id: `unstaffed-${r.id}`,
      severity: 'medium',
      category: 'unstaffed',
      title: `${r.name} has no one assigned`,
      description: 'Vacant roles slow delivery and weaken GDS service standard coverage.',
      entityId: r.id,
    });
  });

  const nameCount = new Map<string, DesignGraphEntity[]>();
  entities.forEach((e) => {
    const key = e.name.toLowerCase().trim();
    nameCount.set(key, [...(nameCount.get(key) || []), e]);
  });
  nameCount.forEach((list, key) => {
    if (list.length > 1) {
      issues.push({
        id: `dup-${key}`,
        severity: 'low',
        category: 'duplicate',
        title: `${list.length} entities share the name "${list[0].name}"`,
        description: 'Duplicate names create confusion. Rename or merge them.',
        entityId: list[0].id,
      });
    }
  });

  // GDS multidisciplinary coverage
  const roleNames = roles.map((r) => r.name.toLowerCase());
  for (const [key, def] of Object.entries(GDS_ROLE_ALIASES)) {
    const present = def.labels.some((label) => roleNames.some((n) => n.includes(label)));
    if (!present && roles.length > 0) {
      issues.push({
        id: `gds-missing-${key}`,
        severity: key === 'user-researcher' || key === 'service-owner' ? 'high' : 'medium',
        category: 'gds',
        title: `Missing GDS role: ${key.replace(/-/g, ' ')}`,
        description:
          'Multidisciplinary GDS service teams typically include this role. Absence may weaken Service Standard coverage.',
        standardPointHints: def.pointHints,
      });
    }
  }

  const entitiesWithPurpose = entities.filter((e) => e.purpose && e.purpose.trim()).length;
  const entitiesWithAccountabilities = entities.filter(
    (e) => asStringArray(e.accountabilities).length > 0,
  ).length;
  const rolesStaffed = roles.filter((r) => assignedEntityIds.has(r.id)).length;

  let score = 100;
  issues.forEach((i) => {
    if (i.severity === 'high') score -= 10;
    else if (i.severity === 'medium') score -= 5;
    else score -= 2;
  });
  if (entities.length > 0) {
    const purposeCoverage = entitiesWithPurpose / entities.length;
    score -= Math.round((1 - purposeCoverage) * 10);
  }
  score = Math.max(0, Math.min(100, score));

  return {
    totals: {
      entities: entities.length,
      circles: entities.filter((e) => e.type === 'circle').length,
      roles: roles.length,
      products: entities.filter((e) => e.type === 'product').length,
      relationships: relationships.length,
      people: people.length,
      assignments: assignments.length,
      vacancies: unstaffed.length,
    },
    spanOfControl: { average: Math.round(avgSpan * 10) / 10, max: maxSpan, distribution: dist },
    hierarchyDepth: maxDepth,
    coverage: {
      entitiesWithPurpose,
      entitiesWithAccountabilities,
      rolesStaffed,
      rolesTotal: roles.length,
    },
    healthScore: score,
    issues: issues.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.severity] - order[b.severity];
    }),
  };
}

export function structureReadinessHints(insights: OrgInsights): Array<{
  issueId: string;
  title: string;
  severity: OrgIssue['severity'];
  standardPointHints: string[];
  description: string;
}> {
  return insights.issues
    .filter((i) => (i.standardPointHints && i.standardPointHints.length > 0) || i.category === 'gds')
    .map((i) => ({
      issueId: i.id,
      title: i.title,
      severity: i.severity,
      standardPointHints: i.standardPointHints ?? [],
      description: i.description,
    }));
}
