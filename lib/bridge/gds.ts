/**
 * Vocabulary bridge from Datum pillars and rigour signals to GDS / DDaT.
 * Populated from the published Service Standard and the crosswalk seed
 * (NISTA, TCoP, ISO 19650, Construction Playbook, Building Safety Act).
 */

import type { RigourSignalType } from '@/lib/scoring/fit';

export type GdsPointRef = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface BridgeMapping {
  id: string;
  label: string;
  gdsPoints: GdsPointRef[];
  ddat: string;
  panelWouldAsk: string;
  ceremony?: string;
}

export const PILLAR_BRIDGE: Record<string, BridgeMapping> = {
  'The Forge': {
    id: 'forge',
    label: 'The Forge',
    gdsPoints: [5, 6],
    ddat: 'Profession capability: evidenced skill levels per person',
    panelWouldAsk:
      'Who on this team holds the skills the roles need, and how was that evidenced rather than asserted?',
  },
  'Squad Blueprint': {
    id: 'blueprint',
    label: 'Squad Blueprint',
    gdsPoints: [6, 7],
    ddat: 'Multidisciplinary team shape and role families',
    panelWouldAsk:
      'Is this a multidisciplinary team that can decide, or a collection of borrowed specialists?',
  },
  'The Keel': {
    id: 'keel',
    label: 'The Keel',
    gdsPoints: [6, 7, 14],
    ddat: 'Delivery management: assignment, capacity, tenure',
    panelWouldAsk:
      'Who stayed for the phase, at what FTE, and can they explain the decisions to a panel?',
  },
  'DevOps Spec': {
    id: 'devops',
    label: 'DevOps Spec',
    gdsPoints: [9, 11, 12, 14],
    ddat: 'Technical architecture, development and operations',
    panelWouldAsk:
      'Are statutory and non-functional criteria in the ticket, or authored later for the gate?',
  },
  'Delivery Compass': {
    id: 'compass',
    label: 'Delivery Compass',
    gdsPoints: [7, 10],
    ddat: 'Performance analysis and delivery management',
    panelWouldAsk:
      'What do you measure, how often, and where does that evidence come from in the ceremonies?',
  },
};

export const SIGNAL_BRIDGE: Record<RigourSignalType, BridgeMapping> = {
  nfr_planning: {
    id: 'nfr_planning',
    label: 'NFR planning',
    gdsPoints: [5, 9, 11, 14],
    ddat: 'Technical architecture; quality and accessibility',
    panelWouldAsk: 'Where are the non-functional requirements named before work starts?',
    ceremony: 'Backlog refinement',
  },
  capacity_discipline: {
    id: 'capacity_discipline',
    label: 'Capacity discipline',
    gdsPoints: [6, 7],
    ddat: 'Delivery management',
    panelWouldAsk: 'How do you plan to capacity rather than to hope?',
    ceremony: 'Sprint planning',
  },
  spike_discipline: {
    id: 'spike_discipline',
    label: 'Spike discipline',
    gdsPoints: [8, 11],
    ddat: 'Technical architecture; software development',
    panelWouldAsk: 'When a spike ends, where is the decision written down?',
    ceremony: 'Spike close-out',
  },
  handover_quality: {
    id: 'handover_quality',
    label: 'Handover quality',
    gdsPoints: [6, 11, 14],
    ddat: 'Technical architecture; service ownership',
    panelWouldAsk: 'Can the next team explain this service without a briefing from people who have left?',
    ceremony: 'Phase close',
  },
  assurance_participation: {
    id: 'assurance_participation',
    label: 'Assurance participation',
    gdsPoints: [6, 7, 10],
    ddat: 'Delivery management; performance analysis',
    panelWouldAsk: 'Who from this team has sat in an assessment or gateway and spoken to the work?',
    ceremony: 'Show and tell',
  },
  sustained_assignment: {
    id: 'sustained_assignment',
    label: 'Sustained assignment',
    gdsPoints: [6, 7],
    ddat: 'Delivery management (The Keel, not a ceremony)',
    panelWouldAsk: 'Did the core roles stay for a complete phase at enough FTE to hold the story?',
  },
};

export function gdsPointsLabel(points: GdsPointRef[]): string {
  return `GDS: points ${points.join(', ')}`;
}

export function ceremonyForSignal(type: RigourSignalType): string | null {
  return SIGNAL_BRIDGE[type]?.ceremony ?? null;
}

export function bridgeForPillar(name: string): BridgeMapping | null {
  return PILLAR_BRIDGE[name] ?? null;
}

/** Pillars a Service Standard point maps to, for the assurance secondary label. */
export function pillarsForGdsPoint(point: number): string[] {
  return Object.values(PILLAR_BRIDGE)
    .filter((mapping) => mapping.gdsPoints.includes(point as GdsPointRef))
    .map((mapping) => mapping.label);
}
