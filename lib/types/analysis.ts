import type { Proficiency, Phase, StandardId } from '@/lib/engine/standards-dependency-map';

export type ProficiencyLevel = Proficiency;
export type MatchLevel = 'met' | 'partial' | 'unmet';
export type ReadinessStatus = 'strong' | 'met' | 'partial' | 'gap';

export interface EngineSkillRequirement {
  skillId: string;
  skillName: string;
  requiredLevel: Proficiency;
}

export interface EngineRoleLevel {
  id: string;
  roleId: string;
  roleName: string;
  levelName: string;
  seniorityRank: number;
  skills: EngineSkillRequirement[];
}

export interface EnginePersonSkill {
  skillId: string;
  level: Proficiency;
}

export interface EnginePerson {
  id: string;
  displayName: string;
  isVacancy: boolean;
  skills: EnginePersonSkill[];
}

export interface EngineAssignment {
  personId: string;
  roleLevelId: string;
}

export interface EngineRequirementRole {
  roleLevelId: string;
  weight: number;
}

export interface EnginePointRoleDep {
  roleId: string;
  weight: number;
  minSeniorityRank: number;
}

export interface EnginePointSkillDep {
  skillId: string;
  minLevel: Proficiency;
  weight: number;
}

export interface EngineStandardPoint {
  id: string;
  number: number;
  title: string;
  category?: string | null;
  compositionDriven: boolean;
  statutoryNote?: string | null;
  evidenceTypes: string[];
  phaseEmphasis: Phase[];
  roleDeps: EnginePointRoleDep[];
  skillDeps: EnginePointSkillDep[];
}

export interface SkillMatchDetail {
  skillId: string;
  skillName: string;
  required: Proficiency;
  held: Proficiency | null;
  score: number;
  match: MatchLevel;
  rationale: string[];
}

export interface PersonRoleFitResult {
  personId: string;
  personName: string;
  roleLevelId: string;
  roleName: string;
  fitPercent: number;
  skills: SkillMatchDetail[];
  rationale: string[];
}

export interface CompositionRoleCoverage {
  roleLevelId: string;
  roleName: string;
  covered: boolean;
  assignedPersonIds: string[];
  bestFitPercent: number | null;
  thinCoverage: boolean;
  rationale: string[];
}

export interface CompositionResult {
  overallPercent: number;
  roles: CompositionRoleCoverage[];
  singlePointsOfFailure: string[];
  rationale: string[];
}

export interface ReadinessPointResult {
  pointId: string;
  number: number;
  title: string;
  category?: string | null;
  statutoryNote?: string | null;
  status: ReadinessStatus;
  score: number;
  phaseWeight: number;
  evidenceGaps: string[];
  rationale: string[];
}

export interface ReadinessResult {
  points: ReadinessPointResult[];
  overallPercent: number;
  bandLabel: string;
  bandKey: ReadinessStatus;
}

export interface AdaptationAction {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  improves: string[];
  rationale: string[];
}

export interface AdaptationPlan {
  actions: AdaptationAction[];
}

export interface AnalysisResult {
  fit: PersonRoleFitResult[];
  composition: CompositionResult;
  readiness: ReadinessResult;
  adaptation: AdaptationPlan;
  overallReadiness: number;
  readinessBand: string;
}

export interface AnalysisInput {
  phase: Phase;
  standardId: StandardId;
  requirementRoles: EngineRequirementRole[];
  people: EnginePerson[];
  assignments: EngineAssignment[];
  roleLevels: EngineRoleLevel[];
  standardPoints: EngineStandardPoint[];
  rolesById: Map<string, { id: string; name: string }>;
}
