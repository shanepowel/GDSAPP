/**
 * Single source for product identity and the datum line.
 * Scoring and UI both read DATUM_LINE from here so the rule cannot drift.
 */

export const product = {
  name: 'Datum',
  owner: 'Turner & Townsend',
  thesis: 'The team is the delivery plan.',
  strapline:
    'Datum defines what good delivery looks like, measures the capability held against it, and assembles the squad that can do the work.',
  metaDescription:
    'Datum defines what good delivery looks like, measures the capability held against it, and assembles the squad that can do the work. Read through GDS, the Wales Digital Service Standard, gateway review or the standards on a capital programme.',
  /** The datum. Below this, a role is not safely filled. */
  datumLine: 0.6,
} as const;

export const DATUM_LINE = product.datumLine;

export function formatDatumLine(value: number = DATUM_LINE): string {
  return value.toFixed(2);
}
