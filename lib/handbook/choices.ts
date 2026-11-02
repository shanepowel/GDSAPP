/** Values the new-engagement wizard stores. Labels live in copy. */

export const MARKET_SECTORS = ['public', 'infrastructure', 'real-estate', 'energy', 'other'] as const;
export type MarketSector = (typeof MARKET_SECTORS)[number];

export const COMMERCIAL_MODELS = ['fixed-price', 'time-materials', 'outcome', 'retained'] as const;
export type CommercialModel = (typeof COMMERCIAL_MODELS)[number];

export const SQUAD_SHAPES = ['software', 'data', 'reporting', 'automation', 'discovery'] as const;
export type SquadShape = (typeof SQUAD_SHAPES)[number];

export const STEERING_FREQUENCIES = ['monthly', 'fortnightly'] as const;
export type SteeringFrequency = (typeof STEERING_FREQUENCIES)[number];

export const RAID_TYPES = ['risk', 'assumption', 'issue', 'dependency'] as const;
export type RaidType = (typeof RAID_TYPES)[number];

export const MILESTONE_STATUSES = ['on-time', 'at-risk', 'late', 'replanned'] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];
