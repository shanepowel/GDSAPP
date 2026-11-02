export type DayPart = 'morning' | 'afternoon' | 'evening';

export function hourInLondon(now: Date): number {
  const hour = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: 'numeric',
    hourCycle: 'h23',
  })
    .formatToParts(now)
    .find((part) => part.type === 'hour')?.value;
  return Number(hour ?? '0');
}

export function dayPart(now: Date): DayPart {
  const hour = hourInLondon(now);
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
