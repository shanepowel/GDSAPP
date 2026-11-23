import { describe, expect, it } from 'vitest';
import { DATA_PACK_STAGE, deliveryMethodOf, handbookStagesFor, needsDataPack, ttPhaseForStage } from './method';

describe('delivery method', () => {
  it('falls back to Agile for unknown or missing values', () => {
    expect(deliveryMethodOf(null)).toBe('agile');
    expect(deliveryMethodOf('scrumfall')).toBe('agile');
    expect(deliveryMethodOf('waterfall')).toBe('waterfall');
    expect(deliveryMethodOf('hybrid')).toBe('hybrid');
  });
});

describe('Strategy, Set-up and Delivery', () => {
  it('maps lifecycle stages onto the T&T model', () => {
    expect(ttPhaseForStage('shape')).toBe('strategy');
    expect(ttPhaseForStage('sprint-zero')).toBe('set-up');
    expect(ttPhaseForStage('discovery')).toBe('delivery');
    expect(ttPhaseForStage('operate')).toBe('delivery');
    expect(ttPhaseForStage(null)).toBeNull();
  });
});

describe('data evidence pack', () => {
  it('applies to data and reporting squads only', () => {
    expect(needsDataPack('data')).toBe(true);
    expect(needsDataPack('reporting')).toBe(true);
    expect(needsDataPack('software')).toBe(false);
    expect(needsDataPack(null)).toBe(false);
  });

  it('adds the pack to the stages copied onto a new engagement', () => {
    expect(handbookStagesFor('data')).toEqual(['sprint-zero', DATA_PACK_STAGE]);
    expect(handbookStagesFor('software')).toEqual(['sprint-zero']);
  });
});
