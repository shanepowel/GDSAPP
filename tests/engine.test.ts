import { describe, expect, it } from 'vitest';
import { compareSkillMatch } from '@/lib/engine/skill-match';
import { runAnalysis } from '@/lib/engine';
import type { AnalysisInput } from '@/lib/types/analysis';

describe('skill match', () => {
  it('met when at or above required', () => {
    const r = compareSkillMatch('working', 'practitioner');
    expect(r.score).toBe(1);
    expect(r.match).toBe('met');
  });

  it('partial when one level below', () => {
    const r = compareSkillMatch('practitioner', 'working');
    expect(r.score).toBe(0.5);
    expect(r.match).toBe('partial');
  });

  it('unmet when absent', () => {
    const r = compareSkillMatch('expert', null);
    expect(r.score).toBe(0);
    expect(r.match).toBe('unmet');
  });
});

describe('NRW demo scenario', () => {
  const roleLevels = [
    {
      id: 'service-owner-associate',
      roleId: 'service-owner',
      roleName: 'Service owner',
      levelName: 'Associate',
      seniorityRank: 1,
      skills: [
        { skillId: 'strategic-ownership', skillName: 'Strategic ownership', requiredLevel: 'working' as const },
        {
          skillId: 'stakeholder-relationship-management',
          skillName: 'Stakeholder relationship management',
          requiredLevel: 'practitioner' as const,
        },
      ],
    },
    {
      id: 'user-researcher-working',
      roleId: 'user-researcher',
      roleName: 'User researcher',
      levelName: 'Working',
      seniorityRank: 1,
      skills: [{ skillId: 'user-research', skillName: 'User research', requiredLevel: 'practitioner' as const }],
    },
  ];

  const standardPoints = [
    {
      id: 'wales-2',
      number: 2,
      title: 'Design services in Welsh and English',
      category: 'Meet user needs',
      compositionDriven: false,
      statutoryNote: 'Welsh language statutory',
      evidenceTypes: ['bilingual content'],
      phaseEmphasis: ['discovery' as const],
      roleDeps: [{ roleId: 'content-designer', weight: 1, minSeniorityRank: 0 }],
      skillDeps: [
        { skillId: 'welsh-language-service-capability', minLevel: 'working' as const, weight: 1 },
        { skillId: 'content-design', minLevel: 'practitioner' as const, weight: 1 },
      ],
    },
    {
      id: 'wales-5',
      number: 5,
      title: 'Make sure everyone can use the service',
      category: 'Meet user needs',
      compositionDriven: false,
      statutoryNote: null,
      evidenceTypes: ['WCAG audit'],
      phaseEmphasis: ['discovery' as const],
      roleDeps: [{ roleId: 'accessibility-specialist', weight: 1, minSeniorityRank: 0 }],
      skillDeps: [{ skillId: 'designing-for-everyone', minLevel: 'practitioner' as const, weight: 1 }],
    },
    {
      id: 'wales-6',
      number: 6,
      title: 'Have an empowered service owner',
      category: 'Create digital teams',
      compositionDriven: false,
      statutoryNote: 'Empowered owner',
      evidenceTypes: ['named owner'],
      phaseEmphasis: ['discovery' as const],
      roleDeps: [{ roleId: 'service-owner', weight: 1, minSeniorityRank: 2 }],
      skillDeps: [],
    },
    {
      id: 'wales-3',
      number: 3,
      title: 'Understand users and their needs',
      category: 'Meet user needs',
      compositionDriven: false,
      statutoryNote: null,
      evidenceTypes: ['research plan'],
      phaseEmphasis: ['discovery' as const],
      roleDeps: [{ roleId: 'user-researcher', weight: 1, minSeniorityRank: 0 }],
      skillDeps: [{ skillId: 'user-research', minLevel: 'practitioner' as const, weight: 1 }],
    },
  ];

  const input: AnalysisInput = {
    phase: 'discovery',
    standardId: 'wales',
    requirementRoles: [
      { roleLevelId: 'service-owner-associate', weight: 1 },
      { roleLevelId: 'user-researcher-working', weight: 1 },
    ],
    people: [
      {
        id: 'p1',
        displayName: 'Alex (Service owner)',
        isVacancy: false,
        skills: [
          { skillId: 'strategic-ownership', level: 'awareness' },
          { skillId: 'stakeholder-relationship-management', level: 'working' },
        ],
      },
      {
        id: 'p2',
        displayName: 'Sam (User researcher)',
        isVacancy: false,
        skills: [{ skillId: 'user-research', level: 'working' }],
      },
    ],
    assignments: [
      { personId: 'p1', roleLevelId: 'service-owner-associate' },
      { personId: 'p2', roleLevelId: 'user-researcher-working' },
    ],
    roleLevels,
    standardPoints,
    rolesById: new Map([
      ['service-owner', { id: 'service-owner', name: 'Service owner' }],
      ['user-researcher', { id: 'user-researcher', name: 'User researcher' }],
      ['content-designer', { id: 'content-designer', name: 'Content designer' }],
      ['accessibility-specialist', { id: 'accessibility-specialist', name: 'Accessibility specialist' }],
    ]),
  };

  it('flags Welsh, accessibility, empowered owner and thin research gaps', () => {
    const result = runAnalysis(input);
    expect(result.overallReadiness).toBeLessThan(65);
    const wales2 = result.readiness.points.find((p) => p.number === 2);
    const wales5 = result.readiness.points.find((p) => p.number === 5);
    const wales6 = result.readiness.points.find((p) => p.number === 6);
    const wales3 = result.readiness.points.find((p) => p.number === 3);
    expect(wales2?.status).not.toBe('strong');
    expect(wales5?.status).not.toBe('strong');
    expect(wales6?.status).not.toBe('strong');
    expect(wales3?.status).not.toBe('strong');
    expect(result.adaptation.actions.length).toBeGreaterThan(0);
  });
});
