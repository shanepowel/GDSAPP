import { z } from 'zod';

export const entityTypeSchema = z.enum(['circle', 'role', 'product']);
export const relationshipTypeSchema = z.enum(['includes', 'reports-to', 'collaborates-with']);
export const designBindingSchema = z.enum(['live', 'scenario', 'snapshot']);

export const designEntityInputSchema = z.object({
  name: z.string().min(1),
  type: entityTypeSchema,
  purpose: z.string().nullable().optional(),
  domain: z.string().nullable().optional(),
  accountabilities: z.array(z.string()).optional(),
  policies: z.array(z.string()).optional(),
  parentId: z.string().nullable().optional(),
  ddatRoleId: z.string().nullable().optional(),
  ddatRoleLevelId: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const designEntityUpdateSchema = designEntityInputSchema.partial();

export const designRelationshipInputSchema = z.object({
  sourceId: z.string(),
  targetId: z.string(),
  type: relationshipTypeSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const designPersonInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().nullable().optional(),
  fte: z.number().int().min(0).max(100).optional(),
  skills: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
});

export const designPersonUpdateSchema = designPersonInputSchema.partial();

export const designAssignmentInputSchema = z.object({
  personId: z.string(),
  entityId: z.string(),
  allocation: z.number().int().min(0).max(100).optional(),
});

export type DesignGraphEntity = {
  id: string;
  name: string;
  type: string;
  purpose: string | null;
  domain: string | null;
  accountabilities: string[];
  policies: string[];
  parentId: string | null;
  ddatRoleId?: string | null;
  ddatRoleLevelId?: string | null;
  metadata?: Record<string, unknown>;
};

export type DesignGraphRelationship = {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  metadata?: Record<string, unknown>;
};

export type DesignGraphPerson = {
  id: string;
  name: string;
  email: string | null;
  fte: number;
  skills: string[];
  notes: string | null;
};

export type DesignGraphAssignment = {
  id: string;
  personId: string;
  entityId: string;
  allocation: number;
};

export type DesignGraph = {
  entities: DesignGraphEntity[];
  relationships: DesignGraphRelationship[];
  people?: DesignGraphPerson[];
  assignments?: DesignGraphAssignment[];
};

export type AiPatch = {
  summary?: string;
  entities: Array<{
    tempId: string;
    name: string;
    type: 'circle' | 'role' | 'product';
    purpose?: string | null;
    domain?: string | null;
    accountabilities?: string[];
    parentTempId?: string | null;
    ddatRoleId?: string | null;
  }>;
  relationships: Array<{
    sourceTempId: string;
    targetTempId: string;
    type: 'includes' | 'reports-to' | 'collaborates-with';
  }>;
  updates?: Array<{
    id: string;
    name?: string;
    purpose?: string | null;
    domain?: string | null;
    accountabilities?: string[];
  }>;
};
