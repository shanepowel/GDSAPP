import type { LifecycleStage } from '@/lib/attention/lifecycle';
import { DATA_PACK_SHAPES, DELIVERY_METHODS, type DeliveryMethod } from '@/lib/handbook/choices';

/** Checklist stage for the Data and Analytics evidence pack. It never blocks a stage move. */
export const DATA_PACK_STAGE = 'data-pack';

/** The T&T Strategy, Set-up and Delivery model that the lifecycle stages sit inside. */
export const TT_PHASES = ['strategy', 'set-up', 'delivery'] as const;
export type TtPhase = (typeof TT_PHASES)[number];

/** Engagements created before the method was recorded are treated as Agile. */
export function deliveryMethodOf(value: string | null | undefined): DeliveryMethod {
  return (DELIVERY_METHODS as readonly string[]).includes(value ?? '') ? (value as DeliveryMethod) : 'agile';
}

export function ttPhaseForStage(stage: LifecycleStage | null | undefined): TtPhase | null {
  if (!stage) return null;
  if (stage === 'shape') return 'strategy';
  if (stage === 'sprint-zero') return 'set-up';
  return 'delivery';
}

export function needsDataPack(squadShape: string | null | undefined): boolean {
  return (DATA_PACK_SHAPES as readonly string[]).includes(squadShape ?? '');
}

/** Handbook stages to copy onto a new engagement. */
export function handbookStagesFor(squadShape: string | null | undefined): string[] {
  return needsDataPack(squadShape) ? ['sprint-zero', DATA_PACK_STAGE] : ['sprint-zero'];
}
