import type { Measures } from './types';

/** Display helpers for the four Delivery Compass measures. Targets come from the handbook. */
export const TARGETS = { predictability: 80, quality: 1, teamHealth: 4, clientSatisfaction: 4 };

export function measureTiles(m: Measures) {
  return [
    { key: 'predictability', label: 'Predictability', value: `${m.predictability}%`, onTarget: m.predictability >= TARGETS.predictability, trend: m.trend.predictability, lowerIsBetter: false, footnote: 'Sprint goals met, last 6 sprints · Target 80%', unit: '%' },
    { key: 'quality', label: 'Quality', value: m.quality === null ? 'n/a' : `${m.quality}%`, onTarget: m.quality === null || m.quality < TARGETS.quality, trend: m.trend.quality, lowerIsBetter: true, footnote: 'Bug escape rate · Target under 1%', unit: '%' },
    { key: 'teamHealth', label: 'Team health', value: m.teamHealth.toFixed(1), onTarget: m.teamHealth >= TARGETS.teamHealth, trend: m.trend.teamHealth, lowerIsBetter: false, footnote: 'Monthly health check · Target 4.0', unit: '' },
    { key: 'clientSatisfaction', label: 'Client satisfaction', value: m.clientSatisfaction.toFixed(1), onTarget: m.clientSatisfaction >= TARGETS.clientSatisfaction, trend: m.trend.clientSatisfaction, lowerIsBetter: false, footnote: 'Monthly client pulse · Target 4.0', unit: '' },
  ];
}

export const trendSentence = (label: string, values: number[], unit: string) =>
  values.length < 2 ? `${label}: not enough data` : `${label} over three months: ${values.map((v) => `${v}${unit}`).join(', then ')}`;
